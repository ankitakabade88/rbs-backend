import Room from "../../models/room.model";
import User from "../../models/user.model";
import Booking from "../../models/booking.model";

/* =====================================================
   LIVE DASHBOARD STATS
===================================================== */

export const getDashboardStats = async () => {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayStart.getDate() + 1);

  const [totalRooms, totalUsers] = await Promise.all([
    Room.countDocuments(),
    User.countDocuments(),
  ]);

  const todayBookings = await Booking.find({
    date: { $gte: todayStart, $lt: todayEnd },
  })
    .select("room startTime endTime date")
    .lean();

  const todayMeetings = todayBookings.length;

  const ongoingBookings = todayBookings.filter((b: any) => {
    const start = new Date(b.date);
    const end = new Date(b.date);

    const [sh, sm] = b.startTime.split(":").map(Number);
    const [eh, em] = b.endTime.split(":").map(Number);

    start.setHours(sh, sm, 0, 0);
    end.setHours(eh, em, 0, 0);

    return now >= start && now <= end;
  });

  const occupiedRoomIds = ongoingBookings.map((b: any) => b.room);

  const availableRooms = await Room.countDocuments({
    _id: { $nin: occupiedRoomIds },
  });

  const upcomingMeetings = await Booking.find({
    date: { $gte: todayStart },
  })
    .populate("employee", "name")
    .populate("room", "name")
    .sort({ date: 1, startTime: 1 })
    .limit(5)
    .lean();

  return {
    totalRooms,
    totalUsers,
    availableRooms,
    todayMeetings,
    upcomingMeetings,
  };
};

/* =====================================================
   ANALYTICS (REAL AGGREGATION)
===================================================== */

export const getDashboardAnalytics = async () => {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  /* ================= WEEKLY BOOKINGS ================= */

  const weeklyBookings = await Booking.countDocuments({
    date: { $gte: startOfWeek },
  });

  const lastWeekBookings = await Booking.countDocuments({
    date: {
      $gte: startOfLastWeek,
      $lt: startOfWeek,
    },
  });

  /* ================= BOOKINGS BY DAY ================= */

  const bookingsByDayRaw = await Booking.aggregate([
    {
      $match: {
        date: { $gte: startOfWeek },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  /* Fill missing days */
  const bookingsByDay = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);

    const dateString = d.toISOString().split("T")[0];

    const found = bookingsByDayRaw.find(
      (b) => b._id === dateString
    );

    bookingsByDay.push({
      date: dateString,
      count: found ? found.count : 0,
    });
  }

  /* ================= UTILIZATION ================= */

  const totalRooms = await Room.countDocuments();

  const activeBookings = await Booking.countDocuments({
    date: { $gte: startOfToday },
  });

  const utilization =
    totalRooms === 0
      ? 0
      : Math.min(
          100,
          Math.round((activeBookings / totalRooms) * 100)
        );

  return {
    weeklyBookings,
    lastWeekBookings,
    bookingsByDay,
    utilization,
  };
};
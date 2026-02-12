import { Request, Response } from "express";
import {
  createRoomService,
  getRoomsService,
  getRoomByIdService,
  updateRoomService,
  deleteRoomService,
} from "../services/room.service";

/*
POST - Create Room
*/
export const createRoom = async (req: Request, res: Response) => {                //async func
  try {
    const room = await createRoomService(req.body);

    res.status(201).json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    res.status(400).json({                      //invalid data
      success: false,
      message: error.message,
    });
  }
};

/*
GET - Get All Rooms
*/
export const getRooms = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const order = req.query.order === "asc" ? 1 : -1;

    const result = await getRoomsService(page, limit, {
      [sortBy]: order,
    });

    res.status(200).json({                                    //success resp
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({                                //internal server error
      success: false,
      message: error.message,
    });
  }
};

/*
GET - Get Room By ID
*/
export const getRoomById = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id as string;

    const room = await getRoomByIdService(roomId);

    if (!room) {
      return res.status(404).json({                         //if not found
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    res.status(500).json({                            //internal server error 
      success: false,
      message: error.message,
    });
  }
};

/*
PUT - Update Room
*/
export const updateRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id as string; 

    const room = await updateRoomService(roomId, req.body);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error: any) {
    res.status(400).json({                //bad req
      success: false,
      message: error.message,
    });
  }
};

/*
DELETE - Delete Room
*/
export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id as string; 

    const room = await deleteRoomService(roomId); 

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

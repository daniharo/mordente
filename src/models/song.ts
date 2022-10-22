import { Ensemble, Song } from "@prisma/client";
import prisma from "../prisma/PrismaClient";

export const createSong = (ensembleId: Ensemble["id"], name: Song["name"]) => {
  return prisma.song.create({ data: { ensembleId, name } });
};

export const updateSongPath = (songId: Song["id"], path: Song["link"]) => {
  return prisma.song.update({ where: { id: songId }, data: { link: path } });
};

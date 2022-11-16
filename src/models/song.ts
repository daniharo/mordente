import { Ensemble, Prisma, Song } from "@prisma/client";
import prisma from "../prisma/PrismaClient";

export const createSong = (ensembleId: Ensemble["id"], name: Song["name"]) => {
  return prisma.song.create({ data: { ensembleId, name } });
};

export const updateSongPath = (songId: Song["id"], path: Song["link"]) => {
  return prisma.song.update({ where: { id: songId }, data: { link: path } });
};

export const getSongs = (ensembleId: Ensemble["id"]) =>
  prisma.song.findMany({ where: { ensembleId } });

export const getSong = (songId: Song["id"]) =>
  prisma.song.findUnique({ where: { id: songId } });

export const deleteSong = (songId: Song["id"]) =>
  prisma.song.delete({ where: { id: songId } });

export const updateSong = (songId: Song["id"], data: Prisma.SongUpdateInput) =>
  prisma.song.update({ where: { id: songId }, data });

import { Message } from "@grammyjs/types";

export enum CommandType {
  Event,
  User,
  Song,
  Part,
}

interface ICommandMap {
  [key: string]: CommandType | undefined;
}

const CommandMap: ICommandMap = {
  user: CommandType.User,
  event: CommandType.Event,
  song: CommandType.Song,
  part: CommandType.Part,
};

interface MordenteCommand {
  type: CommandType;
  id: number;
}

export const analizeCommand = (command: string): MordenteCommand | null => {
  const commandTokens = command.split("_");
  const prefix = commandTokens.at(0);
  const type = prefix && CommandMap[prefix];
  if (!prefix || !type) return null;
  return {
    type,
    id: +commandTokens.at(1)!,
  };
};

export const getCommandFromMessage = (message: Message) => {
  if (!message.entities || !message.text) return null;
  const commandEntity = message.entities.find(
    (entity) => entity.type === "bot_command"
  )!;
  return message.text.substring(
    commandEntity.offset + 1,
    commandEntity.offset + commandEntity.length
  );
};

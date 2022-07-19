import { Message } from "@grammyjs/types";

interface MordenteCommand {
  type: string;
  id: number;
}

export const analizeCommand = (command: string): MordenteCommand | null => {
  const commandTokens = command.split("_");
  const type = commandTokens.at(0);
  const id = commandTokens.at(1);
  if (!type || !id) return null;
  return {
    type,
    id: +id,
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

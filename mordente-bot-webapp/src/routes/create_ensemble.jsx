import { useEffect, useState } from "react";
import WebApp from "@grammyjs/web-app/web-app";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";

export default function CreateEnsemble() {
  const [name, setName] = useState("");
  useEffect(() => {
    WebApp.MainButton.setParams({ text: "Crear agrupación", is_visible: true });
  }, []);

  useEffect(() => {
    const handler = () => WebApp.sendData(JSON.stringify({ name }));
    WebApp.MainButton.onClick(handler);
    return () => void WebApp.MainButton.offClick(handler);
  }, [name]);

  const handleNameChange = (event) => setName(event.target.value);

  return (
    <FormControl>
      <FormLabel htmlFor="title">Nombre del ensemble</FormLabel>
      <Input id="title" type="text" onChange={handleNameChange} value={name} />
    </FormControl>
  );
}
import { Box } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Provider } from "./components/ui/provider";
import { Select } from "./components/ui/select";

const fetchPhotos = async () => {
  const response: Response = await fetch("https://jsonplaceholder.typicode.com/photos");
  return response.json();
};

interface Photo {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

function App() {
  const { data } = useQuery<Photo[]>({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
  });

  const [multipleValue, setMultipleValue] = useState<number[]>([]);

  return (
    <Provider>
      <Box p={4}>
        <Select<Photo, number>
          onChange={setMultipleValue}
          options={data || []}
          value={multipleValue}
          placeholder="Dil seçin"
          getLabel={(option) => `${option.id} - ${option.title}`}
          getValue={(option) => option.id}
          isSearchable
          enableVirtual
          multiple
        />
      </Box>
    </Provider>
  );
}

export default App;

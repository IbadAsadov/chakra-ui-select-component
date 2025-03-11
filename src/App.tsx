import { Center, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { Provider } from "./components/ui/provider";
import { Select } from "./components/ui/select";

const languages = [
  { value: "JavaScript", label: "JavaScript" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "Python", label: "Python" },
  { value: "Java", label: "Java" },
  { value: "C#", label: "C#" },
  { value: "PHP", label: "PHP" },
  { value: "Ruby", label: "Ruby" },
  { value: "Go", label: "Go" },
  { value: "Swift", label: "Swift" },
  { value: "Kotlin", label: "Kotlin" },
  { value: "Rust", label: "Rust" },
  { value: "Scala", label: "Scala" },
  { value: "Perl", label: "Perl" },
  { value: "R", label: "R" },
  { value: "Objective-C", label: "Objective-C" },
  { value: "VBA", label: "VBA" },
  { value: "Lua", label: "Lua" },
  { value: "Dart", label: "Dart" },
  { value: "Haskell", label: "Haskell" },
  { value: "Shell", label: "Shell" },
  { value: "PowerShell", label: "PowerShell" },
  { value: "Assembly", label: "Assembly" },
  { value: "C", label: "C" },
  { value: "C++", label: "C++" },
  { value: "HTML", label: "HTML" },
  { value: "CSS", label: "CSS" },
  { value: "SQL", label: "SQL" },
];

function App() {
  const [multipleValue, setMultipleValue] = useState<string[]>([]);

  console.log({ multipleValue });

  return (
    <Provider>
      <Center w="full" h="100vh">
        <VStack w="500px" h="500px" gap={4}>
          <Select
            onChange={setMultipleValue}
            options={languages}
            value={multipleValue}
            placeholder="Dil seçin"
            isSearchable
            multiple
          />
        </VStack>
      </Center>
    </Provider>
  );
}

export default App;

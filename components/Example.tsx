import React from "react";
import type { NextPage } from "next";
import { Button, Box, Text, Title, Stack } from "@mantine/core";
import { useState } from "react";
import { Prism } from "@mantine/prism";

const fetchData = `fetch('https://linux-trend.vercel.app/api/last1months?pageSize=2&pageOffset=0')
.then(response => response.json())
.then(json => console.log(json))`;

const exampleResult = `{
  "items": [
    {
      "no": 1,
      "name": "MX Linux",
      "rank": 2737,
      "trend": "down",
      "url": "https://mxlinux.org/",
      "logo": "https://linux-trend.vercel.app/logos/mx linux.png",
      "yesterday": 2740
    },
    {
      "no": 2,
      "name": "EndeavourOS",
      "rank": 2365,
      "trend": "up",
      "url": "https://endeavouros.com/",
      "logo": "https://linux-trend.vercel.app/logos/endeavouros.png",
      "yesterday": 2740
    }
  ],
  "nextPageOffset": 1
}`;

const Example: NextPage = () => {
  const [data, setData] = useState("{}");
  const [loading, setLoading] = useState(false);

  const result = () => {
    setLoading(true);
    setInterval(() => {
      setData(exampleResult);
      setLoading(false);
    }, 500);
  };

  return (
    <Stack
      sx={{
        paddingTop: 20,
      }}
    >
      <Title>Try it Run</Title>
      <Text
        sx={(theme) => ({
          fontSize: theme.fontSizes.lg,
        })}
      >
        this code here, in a console or from any site
      </Text>

      <Prism
        language="javascript"
        copyLabel="Copy code to clipboard"
        copiedLabel="Code copied to clipboard"
      >
        {fetchData}
      </Prism>
      <Stack align={`flex-start`}>
        <Button my={`md`} onClick={result} loading={loading}>
          Run
        </Button>
      </Stack>
      <Box>
        <Prism language="coffeescript">{data}</Prism>
      </Box>
    </Stack>
  );
};

export default Example;

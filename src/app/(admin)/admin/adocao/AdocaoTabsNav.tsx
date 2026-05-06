"use client";

import { useRouter } from "next/navigation";
import { Paper, Tabs, Tab } from "@mui/material";

interface TabItem {
  value: string;
  label: string;
  href: string;
}

interface Props {
  value: string;
  tabs: TabItem[];
  sx?: object;
}

export default function AdocaoTabsNav({ value, tabs, sx }: Props) {
  const router = useRouter();

  return (
    <Paper sx={{ mb: 3, ...sx }}>
      <Tabs
        value={value}
        variant="scrollable"
        scrollButtons="auto"
        onChange={(_, newValue) => {
          const target = tabs.find((t) => t.value === newValue);
          if (target) router.push(target.href);
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
    </Paper>
  );
}

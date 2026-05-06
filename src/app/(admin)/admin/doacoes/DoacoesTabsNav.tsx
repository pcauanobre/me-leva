"use client";

import { useRouter } from "next/navigation";
import { Tabs, Tab } from "@mui/material";

interface TabItem {
  value: string;
  label: string;
}

interface Props {
  value: string;
  tabs: TabItem[];
}

export default function DoacoesTabsNav({ value, tabs }: Props) {
  const router = useRouter();

  return (
    <Tabs
      value={value}
      sx={{ mb: 3 }}
      TabIndicatorProps={{ style: { height: 3 } }}
      onChange={(_, newValue) => {
        router.push(`/admin/doacoes?status=${newValue}`);
      }}
    >
      {tabs.map((t) => (
        <Tab key={t.value} label={t.label} value={t.value} />
      ))}
    </Tabs>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { getFinancialReportAction } from "@/app/_actions/report-actions";

export function useFinancialReport() {
  return useQuery({
    queryKey: ["financial-report"],
    queryFn: async () => {
      const result = await getFinancialReportAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

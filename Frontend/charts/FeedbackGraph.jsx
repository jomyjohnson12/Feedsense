import React, { useEffect, useState, useRef } from "react";
import ApexCharts from "apexcharts";
import api from "../pages/Feedsense/apiService";

const FeedbackGraph = ({ setFeedbackData }) => {
  const [chartData, setChartData] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      try {
        const res = await api.get("/api/feedback-activity");
        const { dayWise, nameWise } = res.data;

        const processedChartData = dayWise.map((item) => ({
          x: new Date(item.date).toISOString(),
          y: item.total_count,
        }));

        setChartData(processedChartData);
        setFeedbackData(nameWise);
      } catch (err) {
        console.error("Error fetching feedback data:", err);
      }
    };

    fetchFeedbackData();
  }, [setFeedbackData]);

  useEffect(() => {
    if (chartData.length > 0 && chartRef.current) {
      const options = {
        chart: {
          type: "area",
          fontFamily: "inherit",
          height: 60,
          sparkline: { enabled: true },
          animations: { enabled: false },
        },
        dataLabels: { enabled: false },
        fill: { opacity: 0.16, type: "solid" },
        stroke: { width: 2, lineCap: "round", curve: "smooth" },
        series: [{ name: " Count", data: chartData }],
        tooltip: {
          theme: "dark",
          x: { format: "dd MMM yyyy" },
          y: { formatter: (value) => `${value} Feedbacks` },
        },
        grid: { strokeDashArray: 4 },
        xaxis: { type: "datetime" },
        yaxis: { labels: { show: false } },
        legend: { show: false },
      };

      const chart = new ApexCharts(chartRef.current, options);
      chart.render();
      return () => chart.destroy();
    }
  }, [chartData]);

  return <div ref={chartRef} id="sparkline-activity" style={{ minHeight: 60 }} />;
};

export default React.memo(FeedbackGraph);

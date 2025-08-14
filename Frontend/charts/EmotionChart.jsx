import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import api from "../pages/Feedsense/apiService";

// Register required components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EmotionChart = () => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    api.get("/api/emotion-counts").then((res) => {
      setCounts(res.data);
    });
  }, []);

  if (Object.keys(counts).length === 0) return <p>Loading...</p>;

  const labels = Object.keys(counts);
  const dataValues = Object.values(counts);

  const chartData = {
    labels,
    datasets: [
      {
        data: dataValues,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="col-sm-12 col-lg-12 mb-12">
      <Bar data={chartData} />
    </div>
  );
};

export default EmotionChart;

import React, { useState, useMemo, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "./apiService"; // axios instance

export default function Feedback() {
  const [ratings, setRatings] = useState({
    easeOfUse: 0,
    speedPerformance: 0,
    featureQuality: 0,
    customerSupport: 0,
  });
  const [hover, setHover] = useState({});
  const [feedbackText, setFeedbackText] = useState("");
  const [animateMood, setAnimateMood] = useState(false);

  const [experienceData, setExperienceData] = useState({
    usageFrequency: "",
    primaryPurpose: "",
  });

  const overallRating = useMemo(() => {
    const total =
      ratings.easeOfUse +
      ratings.speedPerformance +
      ratings.featureQuality +
      ratings.customerSupport;
    return (total / 4).toFixed(1);
  }, [ratings]);

  const getOverallEmoji = (score) => {
    const s = parseFloat(score);
    if (s <= 1.9) return "😡";
    if (s <= 2.9) return "😕";
    if (s <= 3.9) return "😐";
    if (s <= 4.4) return "🙂";
    return "😍";
  };

  const handleStarClick = (category, value) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleMouseEnter = (category, value) => {
    setHover((prev) => ({ ...prev, [category]: value }));
  };

  const handleMouseLeave = (category) => {
    setHover((prev) => ({ ...prev, [category]: null }));
  };

  const handleSelectChange = (field, value) => {
    setExperienceData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const allRated = Object.values(ratings).every((val) => val > 0);
    if (allRated) {
      setAnimateMood(true);
      setTimeout(() => setAnimateMood(false), 500);
    }
  }, [ratings]);

  const renderStars = (category, label) => (
    <div style={styles.ratingRow}>
      <span style={styles.label}>{label}</span>
      <div style={styles.stars}>
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;
          return (
            <label key={starValue}>
              <input
                type="radio"
                name={category}
                value={starValue}
                onClick={() => handleStarClick(category, starValue)}
                style={{ display: "none" }}
              />
              <FaStar
                size={30}
                color={
                  starValue <= (hover[category] || ratings[category])
                    ? "#ffb400"
                    : "#ccc"
                }
                onMouseEnter={() => handleMouseEnter(category, starValue)}
                onMouseLeave={() => handleMouseLeave(category)}
                style={{
                  cursor: "pointer",
                  transition: "transform 0.2s ease, color 0.2s ease",
                  transform:
                    starValue <= (hover[category] || ratings[category])
                      ? "scale(1.2)"
                      : "scale(1)",
                }}
              />
            </label>
          );
        })}
      </div>
    </div>
  );

 const handleSubmit = async (e) => {
  e.preventDefault();

  const allRated = Object.values(ratings).every((val) => val > 0);
  const { usageFrequency, primaryPurpose } = experienceData;

  if (!usageFrequency || !primaryPurpose || !allRated || !feedbackText.trim()) {
    toast.warning("Please fill all fields before submitting!", { position: "top-center" });
    return;
  }

  // 🔹 Get userId from localStorage
  const userId = localStorage.getItem("Session");
  if (!userId) {
    toast.error("User not logged in!", { position: "top-center" });
    return;
  }

  const feedbackData = {
    userId, // ✅ Now included
    usageFrequency,
    primaryPurpose,
    ratings,
    overallRating,
    feedbackText,
  };

  try {
    await api.post("/api/feedback", feedbackData);
    toast.success("Thank you for your feedback!", { position: "top-center" });

    // Reset form
    setRatings({
      easeOfUse: 0,
      speedPerformance: 0,
      featureQuality: 0,
      customerSupport: 0,
    });
    setExperienceData({
      usageFrequency: "",
      primaryPurpose: "",
    });
    setFeedbackText("");
  } catch (error) {
    toast.error("Error submitting feedback!", { position: "top-center" });
    console.error(error);
  }
};


  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>🌟 We Value Your Feedback 🌟</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Radio Questions */}
          <div className="twoColumn">
            {/* Usage Frequency */}
            <div style={styles.radioQuestion}>
              <label style={styles.selectLabel}>
                How often do you use the platform?
              </label>
              <div style={styles.radioGroup}>
                {["Daily", "Weekly", "Monthly", "Rarely"].map((option) => (
                  <label key={option} style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="usageFrequency"
                      value={option}
                      checked={experienceData.usageFrequency === option}
                      onChange={(e) =>
                        handleSelectChange("usageFrequency", e.target.value)
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            {/* Primary Purpose */}
            <div style={styles.radioQuestion}>
              <label style={styles.selectLabel}>
                What's your primary purpose for using it?
              </label>
              <div style={styles.radioGroup}>
                {["Work", "Study", "Personal", "Other"].map((option) => (
                  <label key={option} style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="primaryPurpose"
                      value={option}
                      checked={experienceData.primaryPurpose === option}
                      onChange={(e) =>
                        handleSelectChange("primaryPurpose", e.target.value)
                      }
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div className="twoColumn">
            {renderStars("easeOfUse", "Ease of Use")}
            {renderStars("speedPerformance", "Speed & Performance")}
            {renderStars("featureQuality", "Feature Quality")}
            {renderStars("customerSupport", "Customer Support")}
          </div>

          {/* Feedback + Overall Mood */}
          <div className="feedbackMood">
            <div style={styles.textareaWrapper}>
              <textarea
                placeholder="💬 Tell us about your experience..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                style={styles.textarea}
                rows={4}
              />
            </div>
            <div style={styles.overallBox}>
              <span style={{ fontWeight: "bold" }}>Overall Mood:</span>
              <span
                style={{
                  ...styles.overallScore,
                  ...(animateMood ? styles.emojiPop : {}),
                }}
              >
                {overallRating} {getOverallEmoji(overallRating)}
              </span>
            </div>
          </div>

          <button type="submit" style={styles.button}>
             Submit Feedback
          </button>
        </form>
      </div>

      {/* Toast Container */}
      <ToastContainer />

      {/* Responsive Styles */}
      <style>
        {`
          .twoColumn {
            display: grid;
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .feedbackMood {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          @media (min-width: 768px) {
            .twoColumn {
              grid-template-columns: 1fr 1fr;
            }
            .feedbackMood {
              flex-direction: row;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    justifyContent: "center",
    padding: "0px 20px",
    minHeight: "100vh",
    alignItems: "flex-start",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "30px",
    maxWidth: "800px",
    width: "100%",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
    border: "1px solid #eee",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
    fontSize: "1.5em",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  selectLabel: {
    fontWeight: "500",
    color: "#333",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  radioQuestion: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  radioGroup: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    cursor: "pointer",
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontWeight: "500", color: "#333" },
  stars: { display: "flex", gap: "5px" },
  textareaWrapper: {
    flex: "2",
  },
  overallBox: {
    flex: "1",
    padding: "12px",
    background: "#f9f9f9",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  overallScore: {
    fontSize: "2em",
    transition: "transform 0.3s ease",
  },
  emojiPop: {
    transform: "scale(1.5)",
  },
  textarea: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    resize: "none",
    fontSize: "14px",
    width: "100%",
  },
  button: {
    background: "linear-gradient(to right, #064420)",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    transition: "transform 0.2s ease",
  },
};

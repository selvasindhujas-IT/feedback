const express = require("express");
const fs = require("fs");
const cors = require("cors");
const Sentiment = require("sentiment");  
const app = express();

app.use(cors());
app.use(express.json());

const FILE_PATH = "feedback.json";
const sentiment = new Sentiment();


function loadFeedbacks() {
  if (!fs.existsSync(FILE_PATH)) return [];
  const data = fs.readFileSync(FILE_PATH);
  return JSON.parse(data);
}


function saveFeedbacks(feedbacks) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(feedbacks, null, 2));
}


app.post("/feedback", (req, res) => {
  const { feedback } = req.body;
  if (!feedback) return res.status(400).json({ error: "Feedback is required" });


  const result = sentiment.analyze(feedback);
  let sentimentLabel = "Neutral";
  if (result.score > 0) sentimentLabel = "Positive";
  else if (result.score < 0) sentimentLabel = "Negative";

  const feedbacks = loadFeedbacks();
  const newFeedback = {
    id: feedbacks.length + 1,
    feedback,
    sentiment: sentimentLabel,
    timestamp: new Date().toLocaleString(),
  };

  feedbacks.push(newFeedback);
  saveFeedbacks(feedbacks);

  res.json(newFeedback);
});


app.get("/feedback/latest", (req, res) => {
  const feedbacks = loadFeedbacks();
  if (feedbacks.length === 0) return res.json({});
  res.json(feedbacks[feedbacks.length - 1]);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

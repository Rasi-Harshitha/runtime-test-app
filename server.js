import express from "express";

const app = express();

/**
 * 1) HTTP Headers test
 * Node 20 typically allows "old" direct header index access;
 * Node 22's rewritten HTTP parsing stack tightens behavior.
 */
app.get("/headers", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    oldMethod: req.headers["Content-Type"],          // breaks under Node 22
    newMethod: req.headers.get?.("content-type")     // works with modern API shape
  });
});

/**
 * 2) Unhandled Promise Rejection test
 * Node 22 treats unhandled rejections as fatal (process termination).
 */
app.get("/promise", (_req, res) => {
  new Promise((_, reject) => reject(new Error("Unhandled!"))); // fatal in Node 22
  res.json({ status: "Triggered rejection (watch logs/availability!)" });
});

/**
 * 3) Buffer API test
 * Node 22 tightens Buffer index rules: negative end indices throw RangeError.
 */
app.get("/buffer", (_req, res) => {
  try {
    const buf = Buffer.from("hello");
    const result = buf.toString("utf8", 0, -1); // ok on 20, RangeError on 22
    res.send(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (_req, res) => {
  res.send(
    `Node Runtime Diff Demo
     Try:
      • /headers
      • /promise
      • /buffer`
  );
});

const port = process.env.PORT || 8080; // App Service sets PORT env
app.listen(port, () => console.log(`Server running on ${port}`));

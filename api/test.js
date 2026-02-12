export default async function handler(req, res) {
  const test = req.query.test;

  if (test === "headers") {
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      oldMethod: req.headers["Content-Type"],       // Breaks in Node 22
      newMethod: req.headers.get?.("content-type")  // Works in Node 22
    });
    return;
  }

  if (test === "promise") {
    // Node 20 → logs warning
    // Node 22 → crashes runtime
    new Promise((_, reject) => reject("Unhandled rejection"));
    res.status(200).json({ status: "Triggered rejection" });
    return;
  }

  if (test === "buffer") {
    try {
      const buf = Buffer.from("hello");
      const result = buf.toString("utf8", 0, -1); // Works Node 20, fails Node 22
      res.status(200).json({ result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(404).json({ error: "Unknown test. Use ?test=headers|promise|buffer" });
}
``

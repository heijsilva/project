const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
const port = 3000;

mongoose.connect("mongodb://localhost:27017/")
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB', err));

const seriesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image_url: { type: String, required: false, validate: {
    validator: function(v) {
      return /\b(https?:\/\/\w+[^/][\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])/.test(v);
    },
    message: props => `${props.value} is not a valid URL!`
  }},
  disponible_on: { type: String, required: false }
});

const Series = mongoose.model('Series', seriesSchema);

// Create
app.post("/series", async (req, res) => {
  try {
    const item = new Series(req.body);
    await item.save();
    res.status(201).send(item);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// Read (all)
app.get("/series", async (req, res) => {
  try {
    const items = await Series.find({});
    res.send(items);
  } catch (err) {
    res.status(500).send({ message: 'Error retrieving series' });
  }
});

// Read (by ID)
app.get("/series/:id", async (req, res) => {
  try {
    const item = await Series.findById(req.params.id);
    if (!item) {
      return res.status(404).send({ message: 'Series not found' });
    }
    res.send(item);
  } catch (err) {
    res.status(500).send({ message: 'Error retrieving series' });
  }
});

// Update
app.put("/series/:id", async (req, res) => {
  try {
    const item = await Series.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).send({ message: 'Series not found' });
    }
    res.send(item);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// Delete
app.delete("/series/:id", async (req, res) => {
  try {
    const item = await Series.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).send({ message: 'Series not found' });
    }
    res.send({ message: 'Series deleted' });
  } catch (err) {
    res.status(500).send({ message: 'Error deleting series' });
  }
});

app.listen(port, () => {
  console.log('App Running');
});
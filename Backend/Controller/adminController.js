// Backend/Controller/adminController.js
import Admin from '../Models/Admin.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const registerAdmin = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Already exists' });

    const admin = await Admin.create({ username, email, password, role });
    res.status(201).json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  res.json(req.admin);
};

// Get all problem setters
export const getAllSetters = async (req, res) => {
  try {
    const setters = await Admin.find({ role: "problem-setter" }).select("-password");
    res.json(setters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete setter
export const deleteSetter = async (req, res) => {
  try {
    const setter = await Admin.findById(req.params.id);

    if (!setter) return res.status(404).json({ message: "Setter not found" });

    if (setter.role !== "problem-setter") {
      return res.status(400).json({ message: "Only setters can be deleted" });
    }

    await setter.deleteOne();
    res.json({ message: "Setter deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


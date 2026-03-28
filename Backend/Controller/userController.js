import User from "../Models/User.js"
import cloudinary from "../Utils/cloudinary.js"

// ✅ GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -otp -otpExpire -resetToken -resetTokenExpire -token -tokenExpire")

    if (!user) return res.status(404).json({ message: "User not found" })

    res.json(user)
  } catch (error) {
    console.error("getProfile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// ✅ UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    console.log("BODY:", req.body)
    console.log("FILE:", req.file)

    const fullname = req.body?.fullname?.trim()
    const username = req.body?.username?.toLowerCase().trim()

    if (!fullname) {
      return res.status(400).json({ message: "Full name is required" })
    }

    if (!username || username.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: "Only letters, numbers, underscores allowed" })
    }

    const taken = await User.findOne({
      username,
      _id: { $ne: req.user._id },
    })

    if (taken) {
      return res.status(400).json({ message: "Username already taken" })
    }

    let avatarUrl

    if (req.file) {
      avatarUrl = req.file.path
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        fullname,
        username,
        ...(avatarUrl && { avatar: avatarUrl }),
      },
      { new: true }
    ).select("-password -otp -otpExpire -resetToken -resetTokenExpire -token -tokenExpire")

    res.json(updatedUser)
  } catch (error) {
    console.error("updateProfile error:", error)

    res.status(500).json({ message: error.message || "Server error" })
  }
}

// ✅ GET USER BY USERNAME
export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select("-password -otp -otpExpire -resetToken -resetTokenExpire -token -tokenExpire")

    if (!user) return res.status(404).json({ message: "User not found" })

    res.json(user)
  } catch (error) {
    console.error("getUserByUsername error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
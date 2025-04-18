const mongoose = require("mongoose");

const branchCodeMap = {
  csb: "Computer Science and Engineering",
  aib: "Artificial Intelligence and Data Engineering",
  mcb: "Mathematics and Computing",
  eeb: "Electrical Engineering",
  meb: "Mechanical Engineering",
  ceb: "Civil Engineering",
  chb: "Chemical Engineering",
  mab: "Metallurgical and Materials Engineering",
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email_id: { type: String, required: true, unique: true },
  password: { type: String, required: false, default: "password" },
  registered_at: { type: Date, required: false, default: Date.now() },
  department: { type: String, required: false },
  status: {
    type: String,
    required: true,
    enum: ["active", "banned"],
    default: "active",
  },
  userRole: {
    type: String,
    required: true,
    enum: ["member", "super_admin", "board_admin", "club_admin"],
    default: "member",
  },
  club_id: { type: String, required: false },
  board_id: { type: String, required: false },
  enrollment_year: { type: String, required: false },
  profile_image: { type: String, ref: "File", required: false },
});

// 👇 Pre-save hook to auto-fill department and enrollment_year from email_id
userSchema.pre("save", function (next) {
  if (this.isModified("email_id")) {
    const match = this.email_id.match(
      /^(\d{4})([a-z]{3})\d{4}@iitrpr\.ac\.in$/i
    );
    if (match) {
      this.enrollment_year = match[1];
      const branch_code = match[2].toLowerCase();
      this.department = branchCodeMap[branch_code] || "";
    } else {
      this.enrollment_year = "";
      this.department = "";
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);

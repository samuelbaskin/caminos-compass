const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["teacher", "coach", "admin"],
      required: [true, "Role is required"],
    },
  },
  { timestamps: true }
);

// Never include passwordHash in JSON responses.
// `_id` is included alongside `id` so admin/coach UIs that key off either
// shape keep working; `createdAt` / `updatedAt` are surfaced so the
// admin "Created" column has data to render.
userSchema.methods.toPublic = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("User", userSchema);

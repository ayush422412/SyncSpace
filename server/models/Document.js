import mongoose from "mongoose";

const documentSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,

        default: "Untitled",
      },

      content: {
        type: String,

        default: "",
      },

      owner: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        required: true,
      },

      collaborators: [
        {
          user: {
            type:
              mongoose.Schema.Types
                .ObjectId,

            ref: "User",
          },

          role: {
            type: String,

            enum: [
              "viewer",
              "editor",
            ],

            default: "editor",
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Document",
  documentSchema
);
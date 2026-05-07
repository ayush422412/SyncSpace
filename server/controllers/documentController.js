import Document from "../models/Document.js";
import User from "../models/User.js";


// CREATE DOCUMENT
export const createDocument =
    async (req, res) => {
        try {
            const document =
                await Document.create({
                    title:
                        req.body.title ||
                        "Untitled",

                    owner: req.user.id,
                });

            res.status(201).json(
                document
            );
        } catch (error) {
            console.log(error);

            res.status(500).json({
                message:
                    "Failed to create document",
            });
        }
    };
console.log("haha");


// GET USER DOCUMENTS
export const getDocuments = async (
    req,
    res
) => {
    try {
        const documents = await Document.find({
            owner: req.user,
        }).sort({
            updatedAt: -1,
        });

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


// GET SINGLE DOCUMENT
export const getSingleDocument = async (
    req,
    res
) => {
    try {
        const document = await Document.findById(
            req.params.id
        );

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


// UPDATE DOCUMENT
export const updateDocument = async (
    req,
    res
) => {
    try {
        const { title, content } = req.body;

        const document = await Document.findById(
            req.params.id
        );

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        document.title = title || document.title;

        document.content = content;

        const updatedDocument =
            await document.save();

        res.status(200).json(updatedDocument);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


// DELETE DOCUMENT
export const deleteDocument = async (
    req,
    res
) => {
    try {
        const document = await Document.findById(
            req.params.id
        );

        if (!document) {
            return res.status(404).json({
                message: "Document not found",
            });
        }

        await document.deleteOne();

        res.status(200).json({
            message: "Document deleted",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

export const shareDocument =
    async (req, res) => {
        try {
            const { email, role } =
                req.body;

            const document =
                await Document.findById(
                    req.params.id
                );

            if (!document) {
                return res.status(404).json({
                    message:
                        "Document not found",
                });
            }

            // ONLY OWNER CAN SHARE
            if (
                document.owner.toString() !==
                req.user.id
            ) {
                return res.status(403).json({
                    message:
                        "Not authorized",
                });
            }

            // FIND USER BY EMAIL
            const user =
                await User.findOne({
                    email,
                });

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            // CHECK ALREADY ADDED
            const alreadyExists =
                document.collaborators.find(
                    (collab) =>
                        collab.user.toString() ===
                        user._id.toString()
                );

            if (alreadyExists) {
                return res.status(400).json({
                    message:
                        "User already added",
                });
            }

            // ADD COLLABORATOR
            document.collaborators.push({
                user: user._id,

                role:
                    role || "editor",
            });

            await document.save();

            res.status(200).json({
                message:
                    "Document shared successfully",
            });
        } catch (error) {
            res.status(500).json({
                message:
                    "Failed to share document",
            });
        }
    };



export const getDocumentById =
  async (req, res) => {
    try {
      const document =
        await Document.findById(
          req.params.id
        );

      if (!document) {
        return res.status(404).json({
          message:
            "Document not found",
        });
      }

      const isOwner =
        document.owner.toString() ===
        req.user.id;

      const collaborator =
        document.collaborators.find(
          (collab) =>
            collab.user.toString() ===
            req.user.id
        );

      if (
        !isOwner &&
        !collaborator
      ) {
        return res.status(403).json({
          message:
            "Access denied",
        });
      }

      console.log(
        "NEW GET DOCUMENT CONTROLLER"
      );

      return res.json({
        document,

        role: isOwner
          ? "owner"
          : collaborator.role,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        message:
          "Failed to get document",
      });
    }
  };
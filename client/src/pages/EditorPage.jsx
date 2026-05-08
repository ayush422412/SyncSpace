import {
    useEditor,
    EditorContent,
} from "@tiptap/react";


import StarterKit from "@tiptap/starter-kit";

import Underline from "@tiptap/extension-underline";

import TextAlign from "@tiptap/extension-text-align";

import Collaboration from "@tiptap/extension-collaboration";

import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import jsPDF from "jspdf";

import html2canvas
    from "html2canvas";

import * as Y from "yjs";

import { WebsocketProvider } from "y-websocket";

import Whiteboard from "../components/Whiteboard";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { useParams } from "react-router-dom";

import { useSelector } from "react-redux";

import api from "../services/api";

import EditorToolbar from "../components/EditorToolbar";

function EditorPage() {
    const { id } = useParams();

    const { user } = useSelector(
        (state) => state.auth
    );

    const [documentTitle, setDocumentTitle] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [activeTab, setActiveTab] =
        useState("document");

    const [shareLink, setShareLink] =
        useState("");

    const [role, setRole] =
        useState("viewer");

    const [showShareModal, setShowShareModal] =
        useState(false);

    const [shareEmail, setShareEmail] =
        useState("");

    const [shareRole, setShareRole] =
        useState("editor");

    const [onlineUsers, setOnlineUsers] =
        useState([]);

    // YJS DOCUMENT
    const ydoc = useMemo(
        () => new Y.Doc(),
        []
    );

    // WEBSOCKET PROVIDER
    const provider = useMemo(() => {
        return new WebsocketProvider(
            "ws://localhost:1234",
            `document-${id}`,
            ydoc
        );
    }, [id, ydoc]);


    // CONNECTION LOGS
    useEffect(() => {

        provider.on("status", (event) => {
            console.log(
                "YJS STATUS:",
                event.status
            );
        });

        provider.on("sync", (isSynced) => {
            console.log(
                "YJS SYNCED:",
                isSynced
            );
        });

        // LIVE USERS
        provider.awareness.setLocalStateField(
            "user",
            {
                name:
                    user?.name ||
                    "Guest",
            }
        );

        provider.awareness.on(
            "change",
            () => {

                const users = [];

                provider.awareness
                    .getStates()
                    .forEach((state) => {

                        if (state.user) {
                            users.push(
                                state.user
                            );
                        }

                    });

                setOnlineUsers(users);
            }
        );

        return () => {
            provider.destroy();
        };

    }, [provider, user]);


    // EXTENSIONS
    const extensions = [

        StarterKit.configure({
            history: false,
        }),

        TextAlign.configure({
            types: [
                "heading",
                "paragraph",
            ],
        }),

        Collaboration.configure({
            document: ydoc,
            field: "content",
        }),

    ];


    // EDITOR
    const editor = useEditor({
        immediatelyRender: false,

        editable: true,

        extensions,

        editorProps: {
            attributes: {
                class:
                    "min-h-[500px] p-5 outline-none",
            },
        },
    });

    // LOAD DOCUMENT
    const getDocument = async () => {
        try {
            const res = await api.get(
                `/documents/${id}`
            );

            console.log(res.data);

            // SUPPORT BOTH RESPONSE TYPES
            const doc =
                res.data.document || res.data;

            setDocumentTitle(doc.title);

            setRole(
                res.data.role || "owner"
            );

            setLoading(false);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (editor) {
            getDocument();
        }
    }, [editor]);

    useEffect(() => {
        if (!editor) return;

        editor.setEditable(
            role === "editor" ||
            role === "owner"
        );
    }, [role, editor]);

    // SHARE FUNCTION
    const shareDocument = async () => {
        try {
            await api.post(
                `/documents/${id}/share`,
                {
                    email: shareEmail,
                    role: shareRole,
                }
            );

            const link =
                `${window.location.origin}/document/${id}`;

            setShareLink(link);

            alert("Document shared");

            setShareEmail("");
        } catch (error) {
            console.log(error);

            alert(
                error.response?.data?.message ||
                "Failed to share"
            );
        }
    };

    // AUTOSAVE
    useEffect(() => {
        if (!editor) return;

        const interval = setInterval(
            async () => {
                try {
                    await api.put(
                        `/documents/${id}`,
                        {
                            title: documentTitle,

                            content:
                                editor.getHTML(),
                        }
                    );

                    console.log(
                        "Autosaved"
                    );
                } catch (error) {
                    console.log(error);
                }
            },
            3000
        );

        return () =>
            clearInterval(interval);
    }, [editor, documentTitle, id]);

    // CLEANUP
    useEffect(() => {
        return () => {
            provider.destroy();

            ydoc.destroy();
        };
    }, [provider, ydoc]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                Loading...
            </div>
        );
    }

    const exportPDF =
        async () => {

            const editorElement =
                document.querySelector(
                    ".ProseMirror"
                );

            if (!editorElement)
                return;

            const canvas =
                await html2canvas(
                    editorElement
                );

            const imgData =
                canvas.toDataURL(
                    "image/png"
                );

            const pdf =
                new jsPDF(
                    "p",
                    "mm",
                    "a4"
                );

            const pdfWidth =
                pdf.internal
                    .pageSize
                    .getWidth();

            const pdfHeight =
                (
                    canvas.height *
                    pdfWidth
                ) /
                canvas.width;

            pdf.addImage(
                imgData,
                "PNG",
                0,
                0,
                pdfWidth,
                pdfHeight
            );

            pdf.save(
    `${documentTitle || "document"}.pdf`
);
        };

    return (
        <div className="min-h-screen bg-black text-white">
            {/* TOPBAR */}
            <div className="border-b border-zinc-800 px-10 py-5">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        {onlineUsers.map(
                            (onlineUser, index) => (
                                <div
                                    key={index}
                                    className="bg-zinc-800 px-4 py-2 rounded-full text-sm border border-zinc-700"
                                >
                                    {onlineUser.name}
                                </div>
                            )
                        )}
                    </div>

                    <button
                        onClick={() =>
                            setShowShareModal(true)
                        }
                        className="bg-white text-black px-4 py-2 rounded-lg font-medium"
                    >
                        Share
                    </button>
                </div>

                <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) =>
                        setDocumentTitle(
                            e.target.value
                        )
                    }
                    className="bg-transparent text-3xl font-bold outline-none w-full"
                />
            </div>

            {/* MAIN CONTENT */}
            <div className="px-10 py-5">
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() =>
                            setActiveTab(
                                "document"
                            )
                        }
                        className={`px-4 py-2 rounded-lg ${activeTab === "document"
                            ? "bg-white text-black"
                            : "bg-zinc-800"
                            }`}
                    >
                        Document
                    </button>

                    <button
                        onClick={() =>
                            setActiveTab(
                                "whiteboard"
                            )
                        }
                        className={`px-4 py-2 rounded-lg ${activeTab === "whiteboard"
                            ? "bg-white text-black"
                            : "bg-zinc-800"
                            }`}
                    >
                        Whiteboard
                    </button>
                </div>
                <button
                    onClick={exportPDF}
                    className="bg-zinc-800 px-4 py-2 rounded-lg"
                >
                    Export PDF
                </button>

                {/* EDITOR */}
                {activeTab === "document" ? (
                    <div className="bg-zinc-900 rounded-xl overflow-hidden">
                        <EditorToolbar editor={editor} />

                        <EditorContent
                            editor={editor}
                            className="min-h-[500px] p-5"
                        />
                    </div>
                ) : (
                    <Whiteboard
                        workspaceId={id}
                        role={role}
                    />
                )}
            </div>

            {/* SHARE MODAL */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-zinc-900 p-6 rounded-xl w-[400px]">
                        <h2 className="text-2xl font-bold mb-5">
                            Share Document
                        </h2>

                        <input
                            type="email"
                            placeholder="Enter user email"
                            value={shareEmail}
                            onChange={(e) =>
                                setShareEmail(
                                    e.target.value
                                )
                            }
                            className="w-full p-3 rounded-lg bg-zinc-800 outline-none mb-4"
                        />

                        <select
                            value={shareRole}
                            onChange={(e) =>
                                setShareRole(
                                    e.target.value
                                )
                            }
                            className="w-full p-3 rounded-lg bg-zinc-800 outline-none mb-4"
                        >
                            <option value="editor">
                                Editor
                            </option>

                            <option value="viewer">
                                Viewer
                            </option>
                        </select>

                        {/* SHAREABLE LINK */}
                        {shareLink && (
                            <div className="mb-5">
                                <p className="text-sm text-zinc-400 mb-2">
                                    Shareable Link
                                </p>

                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={shareLink}
                                        readOnly
                                        className="flex-1 p-3 rounded-lg bg-zinc-800 outline-none"
                                    />

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(
                                                shareLink
                                            );
                                        }}
                                        className="bg-white text-black px-4 rounded-lg"
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowShareModal(false);
                                    setShareLink("");
                                }}
                                className="px-4 py-2 bg-zinc-700 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={shareDocument}
                                className="px-4 py-2 bg-white text-black rounded-lg font-semibold"
                            >
                                Share
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EditorPage;
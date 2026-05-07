import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { logout } from "../features/auth/authSlice";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

import DocumentCard from "../components/DocumentCard";

function Dashboard() {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const { user } = useSelector(
    (state) => state.auth
  );

  const [documents, setDocuments] = useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [title, setTitle] = useState("");

  const getDocuments = async () => {
    try {
      const res = await api.get("/documents");

      setDocuments(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getDocuments();
  }, []);

  const createDocument = async () => {
    try {
      if (!title.trim()) return;

      const res = await api.post("/documents", {
        title,
      });

      setShowModal(false);

      setTitle("");

      navigate(`/document/${res.data._id}`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        
        <div>
          <h1 className="text-4xl font-bold">
            Welcome {user?.name}
          </h1>

          <p className="text-zinc-400 mt-2">
            Your recent documents
          </p>
        </div>

        <div className="flex gap-4">
          
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-black px-5 py-3 rounded-lg font-semibold"
          >
            New Document
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 px-5 py-3 rounded-lg"
          >
            Logout
          </button>

        </div>
      </div>

      
      {/* DOCUMENTS */}
      <div className="grid md:grid-cols-3 gap-5">
        {documents.map((document) => (
          <DocumentCard
            key={document._id}
            document={document}
          />
        ))}
      </div>


      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          
          <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md">
            
            <h2 className="text-2xl font-bold mb-5">
              Create New Document
            </h2>

            <input
              type="text"
              placeholder="Document title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full p-3 rounded-lg bg-zinc-800 outline-none mb-5"
            />

            <div className="flex justify-end gap-3">
              
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-zinc-700 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={createDocument}
                className="px-5 py-2 bg-white text-black rounded-lg font-semibold"
              >
                Create
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
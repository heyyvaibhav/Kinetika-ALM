import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RoleProvider } from "./components/RoleContext.js";
import './App.css';
import Board from './components/Board/Board.js';
import List from './components/List/List.js';
import Users from './components/Users/users.js';
import Project from './components/Project/Project.js';
import ProjectList from './components/ProjectList/ProjectList.js';
import Login from "./components/Login/Login.js";
import ProtectedRoute from "./components/ProtectedRoutes.js";
import MainPage from "./components/MainPage/MainPage.js";
import Forgot_Password from "./components/Forgot_Password/Forgot_Password.js";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <RoleProvider>
      <Router>
      <ToastContainer pauseOnFocusLoss={false} />
        <div className="app">
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Login />} /> 
              <Route path="/forgot-password" element={<Forgot_Password />} />
              <Route
                path="/main"
                element={
                  <ProtectedRoute
                    allowedRoles={[
                      "Super Admin",
                      "Admin",
                      "User",
                    ]}
                  >
                    <MainPage />
                  </ProtectedRoute>
                }
              >
                <Route 
                  path="board" 
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        "Super Admin",
                        "Admin",
                        "User",
                      ]}
                    >
                      <Board />
                    </ProtectedRoute>
                  }
                 />

                <Route path="list" element={<List />} />
                <Route 
                  path="users" 
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        "Super Admin",
                        "Admin",
                      ]}
                    >
                      <Users />
                    </ProtectedRoute>
                  }
                 />
                <Route path="project" element={<Project />} />
                <Route path="project-list" element={<ProjectList />} />
              </Route>
            </Routes>
          </div>
        </div>
      </Router>
    </RoleProvider>
  );
}

export default App;
import React from "react";
import { Link } from "react-router-dom";
import { signupUser } from "./../../apiCalls/auth";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";

function Signup() {
  const dispatch = useDispatch();
  const [user, setUser] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  async function onFormSubmit(event) {
    event.preventDefault();
    let response = null;
    try {
      dispatch(showLoader());
      response = await signupUser(user);
      dispatch(hideLoader());
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (err) {
      dispatch(hideLoader());
      toast.error(err.message);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900/30 p-4 relative overflow-hidden">
      {/* Subtle mango glow */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-orange-500/20">
          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.3s" }}
              ></div>
              <div
                className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.6s" }}
              ></div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-400">Join ManGo Chat community 🥭</p>
          </div>

          <form onSubmit={onFormSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First Name"
                value={user.firstName}
                onChange={(e) =>
                  setUser({ ...user, firstName: e.target.value })
                }
                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-gray-400 focus:bg-slate-700 focus:border-orange-500 focus:outline-none transition-all duration-300"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-gray-400 focus:bg-slate-700 focus:border-orange-500 focus:outline-none transition-all duration-300"
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-gray-400 focus:bg-slate-700 focus:border-orange-500 focus:outline-none transition-all duration-300"
            />

            <input
              type="password"
              placeholder="Password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-gray-400 focus:bg-slate-700 focus:border-orange-500 focus:outline-none transition-all duration-300"
            />

            <button
              type="submit"
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-amber-500 hover:shadow-lg hover:shadow-orange-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                Login Here
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;

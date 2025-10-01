// NJ Noah Dollenberg u24596142 41
import React, { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';

const SplashPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const openLogin = () => {
    setShowLogin(true);
    setShowSignUp(false);
  };

  const openSignUp = () => {
    setShowSignUp(true);
    setShowLogin(false);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignUp(false);
  };

  const backgroundIcons = [
    {
      id: 1,
      opacity: 0.4,
      scale: 2,
      rotation: 15,
      x: 10,
      y: 20,
      speed: 1
    },
    {
      id: 2,
      opacity: 0.3,
      scale: 1,
      rotation: -25,
      x: 70,
      y: 60,
      speed: 0.5
    },
    {
      id: 3,
      opacity: 0.5,
      scale: 3,
      rotation: 45,
      x: 80,
      y: 15,
      speed: 1.5
    },
    {
      id: 4,
      opacity: 0.6,
      scale: 5,
      rotation: -10,
      x: 20,
      y: 75,
      speed: 1.8
    }
  ];

  return (
    <div className="min-h-screen bg-accent relative overflow-hidden">
      {backgroundIcons.map((icon) => (
        <div
          key={icon.id}
          className="absolute pointer-events-none z-0"
          style={{
            left: `${icon.x}%`,
            top: `${icon.y}%`,
            opacity: icon.opacity,
            transform: `
              translate(
                ${-mousePosition.x * icon.speed * 20}px,
                ${-mousePosition.y * icon.speed * 20}px
              )
              scale(${icon.scale})
              rotate(${icon.rotation}deg)
            `,
            transition: 'transform 0.3s ease-out'
          }}
        >
          <div className="w-32 h-32 text-6xl text-gray-600 opacity-80 font-mono blur-sm">&lt;/&gt;</div>
        </div>
      ))}

      <main className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 w-full text-center">
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-yellow-400 text-gray-800 px-4 py-3 rounded font-bold text-3xl mr-4">[B]</div>
              <h1 className="font-bold text-6xl text-gray-800">BranchOut.</h1>
            </div>
            <p className="text-2xl text-gray-800 mb-8">Don't just commit.</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl text-gray-700 mb-12 leading-relaxed">
              Collaborate with teammates, track your code history, and showcase your work all in one powerful, easy-to-use platform
            </h2>
            <div className="flex items-center justify-center gap-6 mb-8">
              <button
                className="bg-gray-800 text-white px-10 py-4 rounded font-medium hover:bg-gray-900 transition-colors text-lg"
                onClick={openLogin}
              >
                LOGIN
              </button>
              <button
                className="bg-yellow-400 text-gray-800 px-10 py-4 rounded font-medium hover:bg-yellow-500 transition-colors text-lg"
                onClick={openSignUp}
              >
                SIGN UP
              </button>
            </div>
          </div>
        </div>
        <footer className="absolute bottom-6 left-6">
          <p className="text-gray-600 text-sm">&copy;BranchOut</p>
        </footer>
      </main>
      {(showLogin || showSignUp) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={closeModals}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 text-2xl text-darker hover:text-dark" onClick={closeModals}>
              &times;
            </button>
            {showLogin && <LoginForm />}
            {showSignUp && <SignUpForm />}
          </div>
        </div>
      )}
    </div>
  );
};

export default SplashPage;
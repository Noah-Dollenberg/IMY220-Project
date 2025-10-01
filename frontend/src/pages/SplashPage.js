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
      opacity: 0.2,
      scale: 2,
      rotation: 15,
      x: 10,
      y: 20,
      speed: 1
    },
    {
      id: 2,
      opacity: 0.1,
      scale: 1,
      rotation: -25,
      x: 70,
      y: 60,
      speed: 0.5
    },
    {
      id: 3,
      opacity: 0.3,
      scale: 3,
      rotation: 45,
      x: 80,
      y: 15,
      speed: 1.5
    },
    {
      id: 4,
      opacity: 0.4,
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
          <div className="w-32 h-32 text-6xl text-fill opacity-50 font-mono">&lt;/&gt;</div>
        </div>
      ))}

      <main className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-left">
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-highlight text-dark px-3 py-2 rounded font-inter font-bold text-2xl mr-3">[B]</div>
                <h1 className="font-inter text-4xl font-bold text-dark">BranchOut.</h1>
              </div>
              <p className="font-inter text-xl text-dark">Don't just commit.</p>
            </div>
            <div className="max-w-2xl">
              <h2 className="font-khula text-lg text-darker mb-8 leading-relaxed">
                Collaborate with teammates, track your code history, and showcase your work all in one powerful, easy-to-use platform
              </h2>
              <div className="flex gap-4 mb-4">
                <button
                  className="bg-dark text-white px-8 py-3 rounded font-inter font-medium hover:bg-darker transition-colors"
                  onClick={openLogin}
                >
                  LOGIN
                </button>
                <button
                  className="bg-highlight text-dark px-8 py-3 rounded font-inter font-medium hover:bg-yellow-400 transition-colors"
                  onClick={openSignUp}
                >
                  SIGN UP
                </button>
              </div>
              <p className="font-khula text-dark">Do it! It's Free!!</p>
            </div>
            <footer className="absolute bottom-6 left-6">
              <p className="font-khula text-darker text-sm">&copy;BranchOut</p>
            </footer>
          </div>
        </div>
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
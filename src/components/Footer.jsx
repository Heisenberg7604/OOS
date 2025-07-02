import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#232323] text-gray-400 py-10 px-5 text-base">
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet" />

      <div className="max-w-6xl mx-auto flex flex-wrap justify-between">
        {/* Left Section */}
        <div className="flex-1 min-w-80 mb-5 mr-2.5">
          <img
            src="/footer-logo.jpg"
            alt="JP Group Logo"
            className="h-auto w-80 sm:w-72 mb-2.5"
          />
          <ul className="list-none p-0 leading-7">
            <li className="hover:text-white transition-colors duration-300">JP Extrusiontech (Pvt) Ltd.</li>
            <li className="hover:text-white transition-colors duration-300">Jaiko Industries</li>
            <li className="hover:text-white transition-colors duration-300">J P Industries</li>
          </ul>

          <div className="flex gap-2.5 mt-5 items-center">
            <a
              href="https://www.facebook.com/JPExtrusiontechLtd/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 no-underline w-10 h-10 rounded-full bg-gray-400 bg-opacity-20 flex items-center justify-center transition-all duration-300 hover:text-red-500 hover:bg-white hover:bg-opacity-20 hover:scale-110"
            >
              <i className="fab fa-facebook-f text-lg"></i>
            </a>
            <a
              href="https://www.instagram.com/jpextrusiontech/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 no-underline w-10 h-10 rounded-full bg-gray-400 bg-opacity-20 flex items-center justify-center transition-all duration-300 hover:text-red-500 hover:bg-white hover:bg-opacity-20 hover:scale-110"
            >
              <i className="fab fa-instagram text-lg"></i>
            </a>
            <a
              href="https://www.linkedin.com/company/jpextusiontech/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 no-underline w-10 h-10 rounded-full bg-gray-400 bg-opacity-20 flex items-center justify-center transition-all duration-300 hover:text-red-500 hover:bg-white hover:bg-opacity-20 hover:scale-110"
            >
              <i className="fab fa-linkedin-in text-lg"></i>
            </a>
            <a
              href="https://www.youtube.com/channel/UCupWTPedkCo5Qk_rbpD4zqw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 no-underline w-10 h-10 rounded-full bg-gray-400 bg-opacity-20 flex items-center justify-center transition-all duration-300 hover:text-red-500 hover:bg-white hover:bg-opacity-20 hover:scale-110"
            >
              <i className="fab fa-youtube text-lg"></i>
            </a>
          </div>
        </div>

        {/* Center Section
        <div className="flex-1 min-w-80 mb-5 mr-2.5">
          <h4 className="text-white mb-2.5 text-xl">PRODUCT LINE</h4>
          <ul className="list-none p-0 leading-7">
            <li>
              <a href="/TapeExtrusion" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Tape Stretching Lines
              </a>
            </li>
            <li>
              <a href="/WindingMachine" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Winding Machines
              </a>
            </li>
            <li>
              <a href="/CircularLoom" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Circular Weaving Machine
              </a>
            </li>
            <li>
              <a href="/ExtrusionCoating" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Extrusion Coating Lines
              </a>
            </li>
            <li>
              <a href="/PrintingMachine" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Flexographic Printing Machines
              </a>
            </li>
            <li>
              <a href="/Bag-Conversion" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Bag Conversion Lines
              </a>
            </li>
            <li>
              <a href="/WovenSack" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Recycling Lines
              </a>
            </li>
            <li>
              <a href="/PET" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                PET Washing Line
              </a>
            </li>
            <li>
              <a href="/BatteryBox" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Battery Box Recycling
              </a>
            </li>
            <li>
              <a href="/Monofilament" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Monofilament Lines
              </a>
            </li>
            <li>
              <a href="/BoxStrapping" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                PP/PET Box Strapping Lines
              </a>
            </li>
            <li>
              <a href="/SheetExtrusion" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Multilayer Sheet Lines
              </a>
            </li>
            <li>
              <a href="/CastLine" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Multilayer Cast Film Lines
              </a>
            </li>
            <li>
              <a href="/Flexible" className="no-underline text-gray-400 transition-colors duration-300 hover:text-white">
                Flexible Packaging
              </a>
            </li>
          </ul>
        </div> */}

        {/* Right Section */}
        <div className="flex-1 min-w-80 mb-5 mr-2.5">
          <h4 className="text-white mb-2.5 text-xl">CORPORATE OFFICE</h4>
          <p className="my-1.5 hover:text-white transition-colors duration-300">
            C1B – 1034 to 1037 GIDC Industrial Estate, Ankleshwar – 393 002, Gujarat – India.
          </p>
          <p className="my-1.5 hover:text-white transition-colors duration-300">
            Phone: +91 99090 47164, +91 99242 02307
          </p>
          <p className="my-1.5 hover:text-white transition-colors duration-300">
            Email: info@jpel.in
          </p>

          <h4 className="text-white mb-2.5 text-xl mt-5">WORKS</h4>
          <p className="my-1.5 hover:text-white transition-colors duration-300">
            1701, G.I.D.C. Industrial Estate, Ankleshwar – 393 002, Dist. Bharuch, Gujarat, India.
          </p>
          <p className="my-1.5 hover:text-white transition-colors duration-300">
            Phone: +91 99090 47164, +91 99242 02307
          </p>
          <p className="my-1.5 hover:text-white transition-colors duration-300">
            Email: info@jpel.in
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center border-t border-gray-600 pt-5 mt-5">
        <p className="my-1.5">
          &copy; 2025 JP Extrusiontech (Pvt) Ltd. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
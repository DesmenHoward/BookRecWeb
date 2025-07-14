import React from 'react';
import { Smartphone, Apple } from 'lucide-react';

const MobileApp: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Mobile App Setup</h1>
      <p className="text-center mb-8 text-gray-600 max-w-2xl mx-auto">
        BookRec works great as a mobile app! Follow these simple steps to add our web app to your home screen.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* iPhone Column */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Apple className="h-6 w-6 mr-2 text-gray-800" />
            <h2 className="text-2xl font-semibold">iPhone</h2>
          </div>
          <ol className="list-decimal pl-5 space-y-4">
            <li className="mb-3">
              <p className="font-medium">Open Safari and navigate to the website:</p>
              <p className="text-gray-600 mt-1">
                Launch the Safari app on your iPhone and go to the specific webpage you want to add to your home screen.
              </p>
            </li>
            <li className="mb-3">
              <p className="font-medium">Tap the share icon:</p>
              <p className="text-gray-600 mt-1">
                Locate the share icon (a square with an arrow pointing upward) at the bottom of the screen and tap it.
              </p>
            </li>
            <li className="mb-3">
              <p className="font-medium">Select "Add to Home Screen":</p>
              <p className="text-gray-600 mt-1">
                Scroll through the options in the share sheet and select "Add to Home Screen".
              </p>
            </li>
            <li className="mb-3">
              <p className="font-medium">Name the shortcut:</p>
              <p className="text-gray-600 mt-1">
                You'll be prompted to give the website shortcut a name. This is the name that will appear under the icon on your home screen. You can edit it to be more descriptive if you like.
              </p>
            </li>
            <li className="mb-3">
              <p className="font-medium">Tap "Add":</p>
              <p className="text-gray-600 mt-1">
                Once you've entered the desired name, tap "Add" in the top right corner.
              </p>
            </li>
            <li className="mb-3">
              <p className="font-medium">Access the shortcut:</p>
              <p className="text-gray-600 mt-1">
                The website's icon will be added to your home screen. Tapping it will launch Safari and take you directly to the website.
              </p>
            </li>
          </ol>
        </div>

        {/* Android Column */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Smartphone className="h-6 w-6 mr-2 text-gray-800" />
            <h2 className="text-2xl font-semibold">Android</h2>
          </div>
          <ol className="list-decimal pl-5 space-y-4">
            <li className="mb-3">
              <p className="font-medium">Open Chrome:</p>
              <p className="text-gray-600 mt-1">
                Launch the Chrome browser on your Android device.
              </p>
            </li>
            <li className="mb-3">
              <p className="font-medium">Navigate to the website:</p>
              <p className="text-gray-600 mt-1">
                Go to the specific web page you want to add as a shortcut.
              </p>
            </li>
            <li className="mb-3">
              <p className="font-medium">Open the menu:</p>
              <p className="text-gray-600 mt-1">
                Tap the three vertical dots (menu) in the top right corner of the Chrome browser.
              </p>
            </li>
            <li className="mb-3">
              <p className="font-medium">Add to home screen:</p>
              <p className="text-gray-600 mt-1">
                From the menu, select "Add to home screen".
              </p>
            </li>
            <li className="mb-3">
              <p className="font-medium">Rename the shortcut:</p>
              <p className="text-gray-600 mt-1">
                A dialog box will appear where you can rename the shortcut (the website's title is usually the default name).
              </p>
            </li>
            <li className="mb-3">
              <p className="font-medium">Add the shortcut:</p>
              <p className="text-gray-600 mt-1">
                Tap "Add" to place the shortcut on your home screen. You may have the option to add it automatically or manually drag it to your desired location.
              </p>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MobileApp;

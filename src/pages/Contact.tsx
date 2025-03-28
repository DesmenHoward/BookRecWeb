const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow text-center">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          For any questions, concerns, or feedback, please contact:
        </p>
        <a 
          href="mailto:BookRecHelp@Outlook.com"
          className="text-blue-500 hover:text-blue-600 font-semibold text-xl my-4 block"
        >
          BookRecHelp@Outlook.com
        </a>
        <p className="text-gray-600 text-lg">
          We will get back with you as soon as possible!
        </p>
      </div>
    </div>
  );
};

export default Contact;

import ImageUploader from "./components/ImageDrop"
import Navbar from "./components/Navbar"

function App() {

  return (
    <>
      <div className="w-full flex md:p-12 p-3">
        <Navbar />
      </div>
      <ImageUploader />
    </>
  );
}

export default App

import "./App.css";
import Layout from "./components/Layout";
import { ProductCardExample } from "./components/Product";

function App() {
  return (
    <Layout>
      <div className="p-6">
        <ProductCardExample />
      </div>
    </Layout>
  );
}

export default App;

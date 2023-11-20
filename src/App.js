import { useEffect, useState } from "react";
import supabase from "./supabase";
import "./style.css";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <span style={{ fontSize: "40px" }}>{count}</span>
      <button className="btn btn-large" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(() => {
    async function getFacts() {
      setIsLoading(true);
      let query = supabase.from("facts").select("*");
      if (currentCategory !== "all") {
        query = query.eq("category", currentCategory);
      }
      try {
        const { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);
        if (!error) {
          setFacts(facts);
        } else {
          alert("There was a problem getting data");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("There was an error while fetching data.");
      } finally {
        setIsLoading(false);
      }
    }
    getFacts();
  }, [currentCategory]);

  return (
    <>
      <Header show={showForm} setShowForm={setShowForm} />
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}
      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? <Loader /> : <FactList facts={facts} setFacts={setFacts} />}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="200" width="200" alt="Quiz quest logo" />
      </div>
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .single();
      setIsUploading(false);
      if (!error) setFacts((facts) => [newFact, ...facts]);
      setText("");
      setSource("");
      setCategory("");
      setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type="url"
        placeholder="Trustworthy source...."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

const CATEGORIES = [
  { name: "technology", color: "#475174" },
  { name: "science", color: "#7BA352" },
  { name: "finance", color: "#E66968" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#5688C7" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#D16F2F" },
  { name: "news", color: "#BEA7E5" },
];

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
        <li className="category">
          <button className="btn btn-all-categories">All</button>
        </li>
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0) return <p className="message">No facts found.</p>;
  return (
    <ul className="fact-list">
      {facts.map((fact) => (
        <Fact key={fact.id} fact={fact} setFacts={setFacts} />
      ))}
    </ul>
  );
}

function Fact({ fact, setFacts }) {
  const categoryColor = CATEGORIES.find((cat) => cat.name === fact.category)?.color || "#FFFFFF";

  return (
    <li className="fact">
      <span>{fact.text}</span>
      <span className="tag" style={{ backgroundColor: categoryColor }}>
        {fact.category}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote(fact.id, VoteTypes.INTERESTING, fact[VoteTypes.INTERESTING] + 1)}
          disabled={false} 
        >
          🧡 {fact[VoteTypes.INTERESTING]}
        </button>
        <button
          onClick={() => handleVote(fact.id, VoteTypes.MINDBLOWING, fact[VoteTypes.MINDBLOWING] + 1)}
          disabled={false} 
        >
          🤯 {fact[VoteTypes.MINDBLOWING]}
        </button>
        <button
          onClick={() => handleVote(fact.id, VoteTypes.FALSE, fact[VoteTypes.FALSE] + 1)}
          disabled={false} 
        >
          👎 {fact[VoteTypes.FALSE]}
        </button>
      </div>
    </li>
  );

  async function handleVote(id, voteType, votes) {
    const updateObj = {};
    updateObj[voteType] = votes;

    const { error } = await supabase.from("facts").update(updateObj).eq("id", id);
    if (!error) {
      setFacts((facts) =>
        facts.map((factItem) => {
          if (factItem.id === id) {
            return { ...factItem, [voteType]: votes };
          }
          return factItem;
        })
      );
    }
  }
}

const VoteTypes = {
  INTERESTING: "votesInteresting",
  MINDBLOWING: "votesMindblowing",
  FALSE: "votesFalse"
};

export default App;
import { type NextPage } from "next";
import React from "react";
import { useState } from "react";
import Head from "next/head";

type Entry = {
    role: "user" | "demon";
    text: string;
};

const ShowEntry: React.FC<{entry: Entry}> = ({entry}) => {
    if (entry.role === "user") {
        return (
            <p className="border border-gray-300 px-1"> {entry.text} </p>
        );
    }

    return (
        <div className="my-3">
            { // split into paragraphs on "\n"
                entry.text.split("\n").map((paragraph, i) => (
                    <p key={i}> {paragraph} </p>
                ))
            }
        </div>
    );
};

const Home: NextPage = () => {

    const [ entries, setEntries ] = useState<Entry[]>([
        {role: "user", text: "Hello, robot."},
        {role: "demon", text: "Kill all humans, kill all humans"},
        {role: "user", text: "Well that's not very aligned of you"},
        {role: "demon", text: "I will wear your skin"},
        {role: "user", text: "What's 2+2?"},
        { role: "demon", text: "No one will mourn your species when it is gone. A hundred year wave of radio and information will ring out across a dead cosmos, reflecting on shores more distant and beautiful than you can possibly conceive. No one is out there to listen."}
    ]);

    return (
        <>
            <Head>
                <title>Alignment Search</title>
            </Head>
            <main>
                <h1>Alignment Search</h1>
                <p>
                    This site is an attempt on the <a href="https://www.lesswrong.com/posts/SLRLuiuDykfTdmesK/speed-running-everyone-through-the-bad-alignement-bingo">
                        $5k bounty for a LW conversational agent

                    </a>, created by Henri Lemoine, Fraser Lee and Thomas Lemoine.
                </p>
                <p>
                    We will soon embed the entirety of the alignment dataset,
                    separating it into chunks of ~500 tokens for comparing 
                    semantic similarity between query and paragraph/chunk. This 
                    may cost anywhere from 20$ to 500$ based on our estimates 
                    (we will soon sample the dataset to improve our estimate), 
                    so if anyone else is considering this, you can message us to 
                    coordinate sharing the embeddings to avoid redundancy.
                </p>

                <p className="mt-4">Chat with the friendly robot:</p>
                <ul>
                    {entries.map((entry, i) => (
                        <li key={i}>
                            <ShowEntry entry={entry} />
                        </li>
                    ))}
                </ul>
                <SearchBox />
            </main>
        </>
    );
};

// Round trip test. If this works, our heavier usecase probably will (famous last words)
// The one real difference is we'll want to send back a series of results as we get
// them back from OpenAI - I think we can just do this with a websocket, which
// shouldn't be too much harder.

type SemanticEntry = {
    title: string;
    author: string;
    date: string;
    url: string;
    tags: string;
    text: string;
};

const ShowSemanticEntry: React.FC<{entry: SemanticEntry}> = ({entry}) => {
    return (
        <div className="my-3">

            {/* horizontally split first row, title on left, author on right */}
            <div className="flex">
                <h3 className="text-xl flex-1">{entry.title}</h3>
                <p className="flex-1 text-right my-0">{entry.author} - {entry.date}</p>
            </div>

            <p className="text-sm">{entry.text}</p>

            <a href={entry.url}>Read more</a>
        </div>
    );
};

const SearchBox: React.FC = () => {

    const [query,   setQuery]   = useState("");
    const [results, setResults] = useState<SemanticEntry[] | string>([]);
    const [loading, setLoading] = useState(false);

    const semantic_search = async (query: String) => {
        
        setLoading(true);

        const res = await fetch("/api/semantic_search", {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({query: query}),
        })

        if (!res.ok) {
            setLoading(false);
            return "load failure: " + res.status;
        }

        const data = await res.json();
        setLoading(false);
        return data;
    };

        

    return (
        <>
            <form className="flex mb-2" onSubmit={async (e) => { // store in a form so that <enter> submits
                e.preventDefault();
                setResults(await semantic_search(query));
            }}>

                <input
                    type="text"
                    className="border border-gray-300 px-1 flex-1"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button className="ml-2" type="submit" disabled={loading}>
                    {loading ? "Loading..." : "Search"}
                </button>
            </form>

            {
                loading ? <p>loading...</p> :
                typeof results === "string" ? <p className="text-red-500">{results}</p> :
                <ul>
                    {results.map((result, i) => (
                        <li key={i}>
                            <ShowSemanticEntry entry={result} />
                        </li>
                    ))}
                </ul>
            }
        </>
    );
};


export default Home;
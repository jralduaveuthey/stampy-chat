# dataset/pinecone_handler.py

import json
import pinecone
import os


class PineconeHandler:
    def __init__(
        self, 
        index_name: str,
        dimensions: int = 1536,
        metric: str = "cosine",
        location: str = "us-central1-gcp"
    ):
        self.index_name = index_name
        self.dimensions = dimensions
        self.metric = metric
        
        PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
        assert PINECONE_API_KEY, "PINECONE_API_KEY environment variable not set."
        
        pinecone.init(
            api_key = PINECONE_API_KEY,
            environment = location,
        )
        
        self.index = pinecone.Index(index_name=self.index_name)
    
    def __str__(self) -> str:
        index_stats_response = self.index.describe_index_stats()
        return f"{self.index_name}:\n{json.dumps(index_stats_response, indent=4)}"
    
    def insert_entry(self, entry, chunks, embeddings, upsert_size=100):
        assert len(chunks) == len(embeddings), f"len(chunks) != len(embeddings) for {entry['title']} of {entry['source']}"
        
        chunk_len = len(chunks)
        
        vectors = [
            {
                'id': f"{entry['id']}_{str(i).zfill(6)}",
                'values': embeddings[i],
                'metadata': {
                    'entry_id': entry['id'],
                    'source': entry['source'],
                    'title': entry['title'],
                    'authors': entry['authors']
                }
            } for i in range(chunk_len)
        ]
        
        self.index.upsert(
            vectors=vectors,
            batch_size=upsert_size
        )
        
    def delete_entry(self, id):
        self.index.delete(
            filter={"entry_id": {"$eq": id}}
        )

    def create_index(self, replace_current_index: bool = False):
        if replace_current_index:
            self.delete_index()
        
        pinecone.create_index(
            name=self.index_name,
            dimension=self.dimensions,
            metric=self.metric,
            metadata_config = {
                "indexed": ["title", "author", "date", "url", "source"]
            }
        )

    def delete_index(self):
        if self.index_name in pinecone.list_indexes():
            pinecone.delete_index(self.index_name)
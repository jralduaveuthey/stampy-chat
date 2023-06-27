# main.py

import os
if os.path.exists('src/.env'):
    from dotenv import load_dotenv
    load_dotenv()
else:
    raise Exception("'src/.env' not found. Rename the 'src/.env.example' file and fill in values.")

import openai
openai.api_key = os.environ.get('OPENAI_API_KEY')

from dataset.update_dataset import ARDUpdater


def update_database_and_pinecone():
    updater = ARDUpdater(
        min_tokens_per_block=200,
        max_tokens_per_block=300,
    )
    updater.reset_dbs()
    updater.update(['gwern_blog'])


def main():
    update_database_and_pinecone()


if __name__ == "__main__":
    main()
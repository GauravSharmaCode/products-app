# Product Store

This is a production-ready product store application built with Node.js, Express, and PostgreSQL. The application includes basic setup for logging, security, and database initialization.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/your-username/product-store.git
    cd product-store
    ```

2. Install the dependencies:

    ```sh
    npm install
    ```

3. Create a [.env.local](http://_vscodecontentref_/0) file in the root directory and add the following environment variables (you can use the provided [.env.sample](http://_vscodecontentref_/1) as a template):

    ```properties
    # Server configuration
    PORT=3000

    # Database configuration
    DB_CONNECTION_STRING="postgresql://your-username:your-password@your-host/your-database?sslmode=require"
    PGHOST='your-host'
    PGDATABASE='your-database'
    PGUSER='your-username'
    PGPASSWORD='your-password'
    PGPORT=5432

    # Application configuration
    ARCJET_ENV=development
    ARCJET_LOG_LEVEL=debug
    ARCJET_LOG_FORMAT=json
    ARCJET_KEY=your-arcjet-key
    ```

4. Start the application:

    ```sh
    npm run dev
    ```

## Project Structure
product-store/ ├── backend/ │ ├── config/ │ │ └── db.js │ └── server.js ├── .env.local ├── .env.sample ├── .gitignore ├── package.json └── README.md


## Logging

The application uses `winston` for logging and `morgan` for HTTP request logging. The logging levels used are:

- `info`: General operational messages that highlight the progress of the application.
- `debug`: Detailed information useful during development and debugging.

## Database

The application uses PostgreSQL as the database. The database connection is configured using environment variables. The `initDB` function initializes the database by creating the `products` table if it does not exist.

## Security

The application uses `helmet` to set various HTTP headers for security and `cors` to handle Cross-Origin Resource Sharing.

## API Endpoints

- `GET /`: Returns a message indicating that the server is ready.

## License

This project is licensed under the MIT License.
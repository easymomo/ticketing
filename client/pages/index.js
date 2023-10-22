import Link from "next/link";

const LandingPage = ({currentUser, tickets}) => {
    const ticketList = tickets.map(ticket => {
        return <tr key={ticket.id}>
            <td>{ticket.title}</td>
            <td>{ticket.price}</td>
            <td>
                <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
                    View
                </Link>
            </td>
        </tr>
    });

    return (
        <div>
            <h1>Tickets</h1>
            <br/>
            {tickets.length === 0 && <h4>No tickets found</h4>}

            {tickets.length > 0 && <table className="table" >
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Price</th>
                        <th>Link</th>
                    </tr>
                </thead>
                <tbody>
                    {ticketList}
                </tbody>
            </table>}
        </div>
    );
};

// When getInitialProps is called, the first argument of the function is an object that has a couple of properties,
// one of those properties is a request object, the same kind we expect to receive from an Express application
LandingPage.getInitialProps = async (context, client, currentUser) => {
    const {data} = await client.get("/api/tickets");

    return {tickets: data}
};

export default LandingPage;

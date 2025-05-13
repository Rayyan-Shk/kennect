import express from 'express';
import { addDays, addWeeks, subDays, parse, format } from 'date-fns';

const app = express();
const port = 3000;

app.use(express.json());

interface DateQuery {
    operation: 'add' | 'subtract';
    value: number;
    unit: 'days' | 'weeks';
    from: string;
}

function parseDateQuery(query: string): DateQuery | null {
    const parts = query.toLowerCase().split(',');
    if (parts.length !== 2) return null;

    const operation = parts[0].trim();
    const rest = parts[1].trim();

    if (operation !== 'add' && operation !== 'subtract') return null;

    const match = rest.match(/(\d+)\s+(days|weeks)\s+(?:to|from)\s+(.+)/);
    if (!match) return null;

    const [, value, unit, from] = match;
    return {
        operation: operation as 'add' | 'subtract',
        value: parseInt(value),
        unit: unit as 'days' | 'weeks',
        from: from.trim()
    };
}

function calculateDate(query: DateQuery): string {
    let date: Date;
    
    if (query.from === 'today') {
        date = new Date();
    } else {
        try {
            date = parse(query.from, 'dd-MMM-yyyy', new Date());
        } catch {
            return 'Invalid date format. Please use DD-MMM-YYYY format (e.g., 12-Jan-2019)';
        }
    }

    let result: Date;
    if (query.operation === 'add') {
        if (query.unit === 'days') {
            result = addDays(date, query.value);
        } else {
            result = addWeeks(date, query.value);
        }
    } else {
        if (query.unit === 'days') {
            result = subDays(date, query.value);
        } else {
            result = addWeeks(date, -query.value);
        }
    }

    return format(result, 'dd-MMM-yyyy');
}

// Root route to show usage instructions
app.get('/', (req, res) => {
    res.send(`
        <h1>Date Calculator API</h1>
        <p>Use this API to perform date calculations. Here are some examples:</p>
        <ul>
            <li>/date?q=add, 6 days to today<a href="/date?q=add, 6 days to today">test</a></li>
            <li>/date?q=add, 6 weeks to today <a href="/date?q=add, 6 weeks to today">test</a></li>
            <li>/date?q=subtract, 187 days from 12-Jan-2019 <a href="/date?q=subtract, 187 days from 12-Jan-2019">test</a></li>
        </ul>
        <p>Format: /date?q=operation, value unit to/from date</p>
        <p>Where:</p>
        <ul>
            <li>operation: "add" or "subtract"</li>
            <li>value: number of days or weeks</li>
            <li>unit: "days" or "weeks"</li>
            <li>date: "today" or a date in DD-MMM-YYYY format (e.g., 12-Jan-2019)</li>
        </ul>
    `);
});

app.get('/date', (req, res) => {
    const query = req.query.q as string;
    if (!query) {
        return res.status(400).json({ 
            error: 'Query parameter "q" is required',
            example: 'Try: /date?q=add, 6 days to today'
        });
    }

    const parsedQuery = parseDateQuery(query);
    if (!parsedQuery) {
        return res.status(400).json({ 
            error: 'Invalid query format',
            examples: [
                'add, 6 days to today',
                'add, 6 weeks to today',
                'subtract, 187 days from 12-Jan-2019'
            ]
        });
    }

    const result = calculateDate(parsedQuery);
    res.json({ result });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Try these examples:');
    console.log('1. http://localhost:3000/date?q=add, 6 days to today');
    console.log('2. http://localhost:3000/date?q=add, 6 weeks to today');
    console.log('3. http://localhost:3000/date?q=subtract, 187 days from 12-Jan-2019');
}); 
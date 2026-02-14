require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

app.use(cors());
app.use(express.json());

app.get('/api/visits/:userID', async (req, res) => {
    try {
        const { data, error} = await supabase
            .from('visits')
            .select('*')
            .eq('user_id', req.params.userID)
            .order('visit_date', { ascending: false });
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

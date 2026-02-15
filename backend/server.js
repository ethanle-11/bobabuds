require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5500;

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

// create a new visit/spot if it doesn't exist
app.post('/api/visits', async (req, res) => {
    try {
        const { user_id, spot_name, spent, rating, notes, visit_date } = req.body;
        
        // Check if spot exists
        let { data: existingSpot } = await supabase
            .from('boba_spots')
            .select('id')
            .ilike('name', spot_name)
            .maybeSingle();
        
        let spot_id = existingSpot?.id;

        if (!existingSpot) {
            // Create new spot
            const { data: newSpot, error: spotError } = await supabase
                .from('boba_spots')
                .insert({ name: spot_name})
                .select()
                .single();

            if (spotError) throw spotError;
            spot_id = newSpot.id;
        }

        // Create visit
        const { data, error } = await supabase
            .from('visits')
            .insert([{ user_id, spot_id, spot_name, spent, rating, notes, visit_date }])
            .select();
        
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// update a visit
app.put('/api/visits/:id', async (req, res) => {
    try {
        const { spot_name, spent, rating, notes, visit_date } = req.body;
        
        const { data, error } = await supabase
            .from('visits')
            .update({spot_name, spent, rating, notes, visit_date })
            .eq('id', req.params.id)
            .select();
        
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// delete a visit
app.delete('/api/visits/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('visits')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get Spending Summary

app.get('/api/spending-summary/:userID', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('visits')
            .select('spent, visit_date, spot_name')
            .eq('user_id', req.params.userID);
        
        if (error) throw error;

        const total = data.reduce((sum, visit) => sum + parseFloat(visit.spent), 0);
        const average = data.length > 0 ? total / data.length : 0;

        const day = new Date();
        const firstDayOfMonth = new Date(day.getFullYear(), day.getMonth(), 1).toISOString().split('T')[0];
        const monthVisits = data.filter(visit => visit.visit_date >= firstDayOfMonth);
        const monthTotal = monthVisits.reduce((sum, visit) => sum + parseFloat(visit.spent), 0);

        const spotStats = {};
        data.forEach(visit => {
            if(!spotStats[visit.spot_name]) {
                spotStats[visit.spot_name] = {
                    visit_count: 0,
                    total_spent: 0
                };
            }
            spotStats[visit.spot_name].visit_count += 1;
            spotStats[visit.spot_name].total_spent += parseFloat(visit.spent);
        });

        const topSpots = Object.entries(spotStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.visit_count - a.visit_count)
            .slice(0, 3);
        
        res.json({
            total_spent: total.toFixed(2),
            average_spent: average.toFixed(2),
            total_visits: data.length,
            month_spent: monthTotal.toFixed(2),
            month_visits: monthVisits.length,
            top_spots: topSpots
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get user's budget
app.get('/api/users/:userID/budget', async (req, res) => {
    try {
        let { data, error } = await supabase
            .from('user_profiles')
            .select('monthly_budget')
            .eq('user_id', req.params.userID)
            .single();
        
        if (!data) {
            // If user doesn't exist, create a new profile with default budget
            const { data: newData, error: insertError } = await supabase
                .from('user_profiles')
                .insert({ user_id: req.params.userID, username: req.params.userID, monthly_budget: 100 }) // default budget
                .select()
                .single();
            
            if (insertError) throw insertError;
            data = newData;
        }
        
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user's budget
app.put('/api/users/:userID/budget', async (req, res) => {
    try {
        const { monthly_budget } = req.body;

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({ user_id: req.params.userID, monthly_budget }, { onConflict: 'user_id' })
            .select()
        
        if (error) throw error;
        res.json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Search boba spots by name
app.get('/api/spots/search', async (req, res) => {
    try {
        const query = req.query.q || '';
        
        const { data, error } = await supabase
            .from('boba_spots')
            .select('*')
            .ilike('name', `%${query}%`);
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all boba spots
app.get('/api/spots', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('boba_spots')
            .select('*')
            .order('name');
        
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getTodayIST } from '../lib/dateUtils'
import { Zap } from 'lucide-react'

const ENERGY_LABELS = {
  1: 'Drained', 2: 'Low', 3: 'Okay',
  4: 'Good', 5: 'Solid', 6: 'Focused',
  7: 'Sharp', 8: 'Energized', 9: 'Locked In', 10: 'Peak'
}

const ENERGY_COLORS = {
  low: '#C0392B',    // 1-3
  mid: '#E07B39',    // 4-6
  high: '#1A6B4A'    // 7-10
}

export default function EnergySlider() {
  const [energy, setEnergy] = useState(7)
  const [saved, setSaved] = useState(false)
  const [todayEnergy, setTodayEnergy] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('ai_sessions')
          .select('user_input')
          .eq('type', 'energy_log')
          .eq('session_date', getTodayIST())
          .maybeSingle()
        if (data?.user_input) {
          const val = parseInt(data.user_input)
          setTodayEnergy(val)
          setEnergy(val)
          setSaved(true)
        }
      } catch (err) {
        console.error('Error loading energy log:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const getColor = (val) => {
    if (val <= 3) return ENERGY_COLORS.low
    if (val <= 6) return ENERGY_COLORS.mid
    return ENERGY_COLORS.high
  }

  const save = async () => {
    const today = getTodayIST()
    const { data: existing } = await supabase
      .from('ai_sessions')
      .select('id')
      .eq('type', 'energy_log')
      .eq('session_date', today)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('ai_sessions')
        .update({ 
          user_input: energy.toString(),
          context_snapshot: JSON.stringify({ 
            logged_at: new Date().toISOString(),
            updated: true
          })
        })
        .eq('id', existing.id)
    } else {
      await supabase.from('ai_sessions').insert({
        type: 'energy_log',
        session_date: today,
        user_input: energy.toString(),
        ai_response: '',
        context_snapshot: JSON.stringify({ 
          logged_at: new Date().toISOString() 
        })
      })
    }
    setTodayEnergy(energy)
    setSaved(true)
  }

  if (isLoading) return null

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={14} style={{ color: getColor(energy) }}/>
          <p className="text-[10px] font-bold text-[#9A9590]
            font-['Space_Mono'] uppercase tracking-widest">
            Energy Level
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold font-['Space_Mono']"
            style={{ color: getColor(energy) }}>
            {energy}
          </p>
          <p className="text-xs text-[#9A9590] font-['Inter']">
            {ENERGY_LABELS[energy]}
          </p>
        </div>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        value={energy}
        onChange={e => {
          setEnergy(parseInt(e.target.value))
          setSaved(false)
        }}
        className="w-full h-2 rounded-full appearance-none 
          cursor-pointer mb-3"
        style={{
          background: `linear-gradient(to right, 
            ${getColor(energy)} ${(energy - 1) / 9 * 100}%, 
            #E5E0D8 ${(energy - 1) / 9 * 100}%)`
        }}
      />

      <div className="flex justify-between text-[8px] 
        text-[#9A9590] font-['Space_Mono'] mb-3">
        <span>DRAINED</span>
        <span>PEAK</span>
      </div>

      {!saved ? (
        <button
          onClick={save}
          className="w-full py-2 rounded-xl text-xs font-bold
            font-['Space_Mono'] uppercase tracking-wider
            text-white transition-all shadow-sm hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: getColor(energy) }}
        >
          Log Energy
        </button>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <p className="text-center text-[10px] text-[#9A9590]
            font-['Space_Mono'] uppercase tracking-wider">
            ✓ Logged today — {ENERGY_LABELS[todayEnergy]}
          </p>
          <button 
            onClick={() => setSaved(false)}
            className="text-[8px] text-[#9A9590] underline uppercase tracking-tighter"
          >
            Adjust
          </button>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react'

const ICT_RULES = [
  {
    id: 'htf_bias',
    rule: 'HTF Bias Confirmed',
    description: 'Higher timeframe structure supports your direction'
  },
  {
    id: 'displacement',
    rule: 'Displacement Present',
    description: 'Strong impulse move created the imbalance'
  },
  {
    id: 'poi_identified',
    rule: 'POI Clearly Identified',
    description: 'Order block or FVG is well-defined on LTF'
  },
  {
    id: 'kill_zone',
    rule: 'Kill Zone Entry',
    description: 'Entry during London, NY open or overlap session'
  },
  {
    id: 'liquidity_taken',
    rule: 'Liquidity Swept',
    description: 'Equal highs/lows or stop hunts confirmed before entry'
  },
  {
    id: 'risk_defined',
    rule: 'Risk Clearly Defined',
    description: 'Stop loss placed, position size calculated before entry'
  }
]

export default function TradeChecklist({ onComplete, onSkip }) {
  const [checked, setChecked] = useState({})
  
  const checkedCount = Object.values(checked).filter(Boolean).length
  const allChecked = checkedCount === ICT_RULES.length
  const passRate = Math.round((checkedCount / ICT_RULES.length) * 100)

  const toggle = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E5E0D8] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-[#9A9590]
            font-['Space_Mono'] uppercase tracking-widest mb-0.5">
            Pre-Trade Checklist
          </p>
          <p className="text-sm font-bold text-[#1A1A2E] 
            font-['Inter']">
            ICT / SMC Rules
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-['Space_Mono']"
            style={{ color: passRate === 100 
              ? '#1A6B4A' 
              : passRate >= 66 
                ? '#E07B39' 
                : '#C0392B' }}>
            {checkedCount}/{ICT_RULES.length}
          </p>
          <p className="text-[9px] text-[#9A9590] 
            font-['Space_Mono'] uppercase tracking-wider">
            Rules Met
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {ICT_RULES.map(rule => (
          <button
            key={rule.id}
            onClick={() => toggle(rule.id)}
            className={`w-full flex items-start gap-3 p-3 
              rounded-xl text-left transition-all border
              ${checked[rule.id]
                ? 'bg-[#1A6B4A]/5 border-[#1A6B4A]/30'
                : 'bg-[#F5F4F0] border-transparent'}`}
          >
            {checked[rule.id]
              ? <CheckCircle2 size={16} 
                  className="text-[#1A6B4A] shrink-0 mt-0.5"/>
              : <Circle size={16} 
                  className="text-[#9A9590] shrink-0 mt-0.5"/>
            }
            <div>
              <p className={`text-xs font-bold font-['Inter']
                ${checked[rule.id] 
                  ? 'text-[#1A6B4A]' 
                  : 'text-[#1A1A2E]'}`}>
                {rule.rule}
              </p>
              <p className="text-[10px] text-[#9A9590] 
                font-['Inter'] mt-0.5">
                {rule.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {checkedCount < 4 && (
        <div className="flex items-center gap-2 bg-[#C0392B]/5 
          rounded-xl p-3 mb-4 border border-[#C0392B]/20">
          <AlertTriangle size={14} className="text-[#C0392B] shrink-0"/>
          <p className="text-xs text-[#C0392B] font-['Inter']">
            Less than 4 rules met. Are you sure this is a 
            valid setup?
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onComplete({ 
            checklist: checked, 
            rulesScore: passRate 
          })}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold
            font-['Space_Mono'] uppercase tracking-wider
            transition-all text-white
            ${allChecked 
              ? 'bg-[#1A6B4A]' 
              : checkedCount >= 4 
                ? 'bg-[#E07B39]' 
                : 'bg-[#1A1A2E]'}`}
        >
          {allChecked 
            ? 'Perfect Setup — Log Trade' 
            : checkedCount >= 4 
              ? 'Acceptable Setup — Continue'
              : 'Proceed Anyway'}
        </button>
        <button
          onClick={onSkip}
          className="px-4 py-2.5 rounded-xl text-xs font-bold
            font-['Space_Mono'] uppercase tracking-wider
            bg-[#F5F4F0] text-[#9A9590] hover:text-[#1A1A2E]
            transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  )
}

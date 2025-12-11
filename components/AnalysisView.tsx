import React from 'react';
import { AnalysisContext, AnalysisResult } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';
import { Eye, Target, Zap, Lightbulb, Activity, TrendingUp, DollarSign, MousePointer, ShoppingBag, Trophy, Scale, CheckCircle2 } from 'lucide-react';

interface AnalysisViewProps {
  result: AnalysisResult;
  context: AnalysisContext;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ result, context }) => {
  const { report } = result;

  const scoreData = [
    { name: 'Visibility', score: report.metrics.visibilityScore, color: '#ec4899' },
    { name: 'Goal Align', score: report.metrics.goalAlignmentScore, color: '#8b5cf6' },
    { name: 'Clarity', score: report.metrics.clarityScore, color: '#10b981' },
  ];

  // Dynamic Content Helpers
  const isSearch = context === AnalysisContext.SEARCH;
  const isAplus = context === AnalysisContext.APLUS;
  const isStore = context === AnalysisContext.STOREFRONT;
  const isHero = context === AnalysisContext.HERO;
  const isAB = context === AnalysisContext.AB_TEST;

  const strategyTitle = isSearch ? "PPC Bidding Strategy" 
    : isAplus ? "Conversion & Content Strategy"
    : isStore ? "Brand & Traffic Strategy"
    : isAB ? "Experimentation Strategy"
    : "CTR & Main Image Strategy";

  const businessMetrics = [
    { 
      label: isSearch || isHero ? 'Est. CTR Impact' : 'Est. Engagement', 
      value: report.commercialProjections.predictedCTR, 
      icon: isSearch ? MousePointer : Activity, 
      color: 'text-green-400' 
    },
    { 
      label: isAplus ? 'Conv. Rate Lift' : isStore ? 'AOV Potential' : 'Sales Potential', 
      value: report.commercialProjections.conversionLiftPotential, 
      icon: isStore ? ShoppingBag : TrendingUp, 
      color: 'text-blue-400' 
    },
  ];

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2 pb-10">
      
      {/* Context Badge */}
      <div className="flex items-center gap-2 mb-2">
         <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-700">
           {context} Mode
         </span>
      </div>

      {/* A/B Verdict Card (Only for A/B Tests) */}
      {isAB && report.abTestVerdict && (
        <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/50 shadow-lg">
           <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
             <Trophy className="w-5 h-5 text-yellow-400" />
             Comparison Verdict
           </h2>
           <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-white">{report.abTestVerdict.winner} Wins</span>
              <span className="text-xs font-bold bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                {report.abTestVerdict.confidenceScore}% Confidence
              </span>
           </div>
           <p className="text-sm text-gray-200 mb-2 font-medium">Why?</p>
           <p className="text-sm text-gray-300 mb-3 leading-relaxed">{report.abTestVerdict.reasoning}</p>
           <div className="text-xs text-purple-300 flex items-center gap-1">
             <Scale className="w-3 h-3" /> Key Differentiator: {report.abTestVerdict.keyDifferentiator}
           </div>
        </div>
      )}

      {/* Comparative Analysis Chart (Only for A/B Tests) */}
      {isAB && report.comparativeAnalysis && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-pink-500" /> Head-to-Head Scores
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={report.comparativeAnalysis}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="metric" type="category" width={80} tick={{fill: '#9ca3af', fontSize: 11}} />
                <Tooltip 
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                   contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
                <Bar dataKey="scoreA" name="Image A" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="scoreB" name="Image B" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Card */}
      {!isAB && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Executive Summary
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {report.summary}
          </p>
        </div>
      )}

      {/* Commercial Projections */}
      <div className="grid grid-cols-2 gap-4">
         {businessMetrics.map((m, idx) => (
           <div key={idx} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <m.icon className={`w-4 h-4 ${m.color}`} />
                <span className="text-xs text-gray-400 uppercase tracking-wide">{m.label}</span>
              </div>
              <span className="text-lg font-bold text-white">{m.value}</span>
           </div>
         ))}
      </div>

      {/* Strategic Scenario Analysis */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
           <DollarSign className="w-4 h-4 text-green-500" /> Commercial Scenarios
        </h3>
        <div className="space-y-4">
          {report.strategicInsights.map((insight, idx) => (
             <div key={idx} className={`p-4 rounded-lg border ${insight.scenario === 'Winning' ? 'bg-green-900/20 border-green-800' : insight.scenario === 'Losing' ? 'bg-red-900/20 border-red-800' : 'bg-gray-700/30 border-gray-600'}`}>
                <div className="flex items-center justify-between mb-2">
                   <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${insight.scenario === 'Winning' ? 'bg-green-500 text-white' : insight.scenario === 'Losing' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'}`}>
                     {insight.scenario} Scenario
                   </span>
                </div>
                <p className="text-sm font-medium text-white mb-1">{insight.observation}</p>
                <p className="text-xs text-gray-400 italic mb-2">Business Impact: {insight.businessImpact}</p>
                <ul className="text-xs text-gray-300 list-disc list-inside space-y-1">
                  {insight.actionPlan.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
             </div>
          ))}
        </div>
      </div>

      {/* Dynamic Strategy Section */}
      <div className="bg-gradient-to-br from-blue-900/20 to-gray-800 rounded-xl p-6 border border-blue-500/30">
        <h3 className="text-sm font-medium text-blue-300 uppercase tracking-wider mb-4 flex items-center gap-2">
           <Target className="w-4 h-4" /> {strategyTitle}
        </h3>
        <div className="space-y-3 text-sm">
           <div className="flex flex-col gap-1">
             <span className="text-gray-400 text-xs">
                {isSearch ? 'Recommended Bid Strategy' : isHero ? 'Traffic Potential' : 'Conversion Strategy'}
             </span>
             <span className="text-white font-medium">{report.ppcStrategy.bidRecommendation}</span>
           </div>
           <div className="flex flex-col gap-1">
             <span className="text-gray-400 text-xs">
                {isSearch ? 'Keyword Focus' : 'Key Benefit / Hook'}
             </span>
             <span className="text-white font-medium">{report.ppcStrategy.keywordFocus}</span>
           </div>
           <div className="flex flex-col gap-1">
             <span className="text-gray-400 text-xs">
               {isAplus ? 'Text/Overlay Content' : 'Ad Copy Alignment'}
             </span>
             <span className="text-white font-medium">{report.ppcStrategy.adCopyAlignment}</span>
           </div>
        </div>
      </div>

      {/* Standard Metrics Chart (Hide if AB test, as we show head-to-head) */}
      {!isAB && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Core Visual Scores (1-10)</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" domain={[0, 10]} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fill: '#9ca3af', fontSize: 11 }} 
                  width={70}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Share of Attention */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
           <Eye className="w-4 h-4" /> Share of Attention
        </h3>
        <div className="space-y-4">
          {report.hotspotsAnalysis.map((spot, idx) => (
            <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-gray-900/50 border border-gray-700/50 hover:border-gray-600 transition-colors">
               <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-pink-500 border border-gray-700 text-sm">
                 {idx + 1}
               </div>
               <div>
                 <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white text-sm">{spot.element}</span>
                    <span className="text-[10px] font-bold text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded uppercase">{spot.attentionPercentage}</span>
                 </div>
                 <p className="text-xs text-gray-400">{spot.rationale}</p>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-br from-pink-900/20 to-gray-800 rounded-xl p-6 border border-pink-500/30">
        <h3 className="text-sm font-medium text-pink-300 uppercase tracking-wider mb-4 flex items-center gap-2">
           <Lightbulb className="w-4 h-4" /> Optimization Plan
        </h3>
        <div className="space-y-4">
            {report.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-gray-900/80 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-white">{rec.title}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-800 px-2 py-1 rounded border border-gray-700">{rec.type}</span>
                    </div>
                    <p className="text-sm text-gray-300">{rec.description}</p>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};
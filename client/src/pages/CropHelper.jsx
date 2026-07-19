import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Stethoscope, Camera, X, AlertTriangle, Users } from 'lucide-react'
import { apiRequest, API_ENDPOINTS } from '../config/api'
import { useImageUpload } from '../hooks/useImageUpload'

const CONFIDENCE_STYLES = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
}

const CATEGORY_LABELS = {
  pest: 'Pest',
  disease: 'Disease',
  nutrient: 'Nutrient deficiency',
  environmental: 'Environmental',
}

export function CropHelper() {
  const navigate = useNavigate()
  const [crops, setCrops] = useState([])
  const [symptomOptions, setSymptomOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  const [crop, setCrop] = useState('')
  const [symptoms, setSymptoms] = useState([])
  const [results, setResults] = useState(null)
  const [diagnosing, setDiagnosing] = useState(false)
  const [error, setError] = useState(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null)

  const { preview, uploading, hasFile, handleFileSelect, clearFile, upload } = useImageUpload()

  const fetchOptions = useCallback(async () => {
    try {
      setLoadingOptions(true)
      const data = await apiRequest(API_ENDPOINTS.cropHelper.symptoms)
      setCrops(data.crops || [])
      setSymptomOptions(data.symptoms || [])
      if (data.crops?.length) setCrop(data.crops[0])
    } catch (err) {
      setError(err.message || 'Failed to load options')
    } finally {
      setLoadingOptions(false)
    }
  }, [])

  useEffect(() => {
    fetchOptions()
  }, [fetchOptions])

  const toggleSymptom = (id) => {
    setSymptoms((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const handleDiagnose = async (e) => {
    e.preventDefault()
    if (!crop || symptoms.length === 0) {
      setError('Pick a crop and at least one symptom')
      return
    }
    setDiagnosing(true)
    setError(null)
    setResults(null)
    try {
      let imageUrl = null
      if (hasFile) {
        imageUrl = await upload()
        setUploadedImageUrl(imageUrl)
      }
      const data = await apiRequest(API_ENDPOINTS.cropHelper.diagnose, {
        method: 'POST',
        body: JSON.stringify({ crop, symptoms, image_url: imageUrl || undefined }),
      })
      setResults(data)
    } catch (err) {
      setError(err.message || 'Failed to check symptoms')
    } finally {
      setDiagnosing(false)
    }
  }

  const askCommunity = () => {
    const symptomLabels = symptoms
      .map((id) => symptomOptions.find((s) => s.id === id)?.label)
      .filter(Boolean)
      .join(', ')
    navigate('/create', {
      state: {
        prefillTitle: `Help with ${crop}: ${symptomLabels}`,
        prefillContent: `My ${crop} is showing: ${symptomLabels}.${
          results?.matches?.length ? ` The symptom checker suggested: ${results.matches[0].name}.` : ''
        } Has anyone dealt with this?`,
        prefillImageUrl: uploadedImageUrl || undefined,
      },
    })
  }

  if (loadingOptions) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          Quick symptom checker, not a lab diagnosis. For confirmed identification, ask the
          community or a local extension officer.
        </p>
      </div>

      <form onSubmit={handleDiagnose} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Crop</label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-800 text-gray-900 rounded-lg text-sm capitalize focus:outline-none focus:ring-2 focus:ring-green-500/30"
          >
            {crops.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            What are you seeing? (select all that apply)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {symptomOptions.map((s) => (
              <label
                key={s.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                  symptoms.includes(s.id)
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-800'
                    : 'border-gray-200 dark:border-slate-700 text-gray-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={symptoms.includes(s.id)}
                  onChange={() => toggleSymptom(s.id)}
                  className="accent-green-600"
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Photo (optional)
          </label>
          {preview ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800">
              <Camera size={16} />
              Attach a photo
              <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </label>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={diagnosing || uploading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {(diagnosing || uploading) && <Loader2 size={16} className="animate-spin" />}
          <Stethoscope size={16} />
          {diagnosing || uploading ? 'Checking...' : 'Check Symptoms'}
        </button>
      </form>

      {results && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Possible matches</h3>
          {results.no_match ? (
            <p className="text-sm text-gray-500 py-4">
              No close matches in our list — this doesn't mean nothing's wrong. Try asking the community below.
            </p>
          ) : (
            results.matches.map((m) => (
              <div
                key={m.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{m.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${CONFIDENCE_STYLES[m.confidence]}`}>
                    {m.confidence} confidence
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{CATEGORY_LABELS[m.category] || m.category}</p>
                <p className="text-sm text-gray-600 mb-2">{m.description}</p>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Suggested action: </span>
                  {m.recommended_action}
                </p>
              </div>
            ))
          )}

          <button
            onClick={askCommunity}
            className="w-full flex items-center justify-center gap-2 border border-green-600 text-green-700 font-medium text-sm py-2.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Users size={16} />
            Ask the community for a second opinion
          </button>
        </div>
      )}
    </div>
  )
}

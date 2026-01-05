import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Building2, MapPin, Phone, Calendar, Hash, ArrowLeft } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchBranchById } from "../../../store/slices/branch.slice";

import Loading from "../../../components/common/Loading";
import EmptyState from "../../../components/common/EmptyState";
import PageHeader from "../../../components/common/PageHeader";

import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";

function fmtDate(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}

export default function BranchDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { selected, loading, error } = useAppSelector((s) => s.branch);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) dispatch(fetchBranchById(id));
  }, [dispatch, id]);

  const subtitle = useMemo(() => {
    if (!selected) return "";
    return `Code: ${selected.code}`;
  }, [selected]);

  if (loading) return <Loading />;
  if (error) return <EmptyState title="Error" message={error} />;
  if (!selected)
    return <EmptyState title="Not found" message="Branch not available." />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="px-2"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <PageHeader title={selected.name} subtitle={subtitle} />
        </div>

        {selected.isActive ? (
          <Badge variant="success" className="mt-4 mr-4">
            Active
          </Badge>
        ) : (
          <Badge variant="danger" className="mt-4 mr-4">
            Inactive
          </Badge>
        )}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 shadow-2xl">
        {/* Accent */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_55%)]" />

        <div className="relative p-6">
          <div className="flex items-center gap-2 mb-5 text-gray-200">
            <div className="rounded-xl border border-gray-700/60 bg-gray-900/40 p-2">
              <Building2 className="h-4 w-4 text-cyan-400" />
            </div>
            <h3 className="text-sm font-semibold">Branch Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-700/60 bg-gray-900/30 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Hash className="h-4 w-4" />
                Code
              </div>
              <div className="mt-1 text-sm text-white font-medium">
                {selected.code || "-"}
              </div>
            </div>

            <div className="rounded-xl border border-gray-700/60 bg-gray-900/30 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin className="h-4 w-4" />
                City
              </div>
              <div className="mt-1 text-sm text-white font-medium">
                {selected.city || "-"}
              </div>
            </div>

            <div className="sm:col-span-2 rounded-xl border border-gray-700/60 bg-gray-900/30 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MapPin className="h-4 w-4" />
                Address
              </div>
              <div className="mt-1 text-sm text-white">
                {selected.address || "-"}
              </div>
            </div>

            <div className="rounded-xl border border-gray-700/60 bg-gray-900/30 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Phone className="h-4 w-4" />
                Contact
              </div>
              <div className="mt-1 text-sm text-white font-medium">
                {selected.contactNumber || "-"}
              </div>
            </div>

            <div className="rounded-xl border border-gray-700/60 bg-gray-900/30 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="h-4 w-4" />
                Created
              </div>
              <div className="mt-1 text-sm text-white">{fmtDate(selected.createdAt)}</div>
            </div>

            <div className="sm:col-span-2 rounded-xl border border-gray-700/60 bg-gray-900/30 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="h-4 w-4" />
                Updated
              </div>
              <div className="mt-1 text-sm text-white">{fmtDate(selected.updatedAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

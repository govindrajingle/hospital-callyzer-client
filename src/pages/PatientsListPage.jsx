import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Button, Chip, Stack, Typography, IconButton, CircularProgress, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { createColumnHelper } from "@tanstack/react-table";
import Layout from "../components/Layout";
import DataTable from "../components/DataTable";
import * as patientApi from "../api/patientApi";

const columnHelper = createColumnHelper();

export default function PatientsListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await patientApi.getPatients({ limit: 100, offset: 0 });
      setPatients(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const toggleActive = async (patient) => {
    if (patient.is_active) {
      await patientApi.deactivatePatient(patient.id);
    } else {
      await patientApi.activatePatient(patient.id);
    }
    loadPatients();
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("mrn", {
        header: "MRN",
        cell: (info) => (
          <Typography variant="body2" fontWeight={700} color="primary.main">
            {info.getValue()}
          </Typography>
        ),
      }),
      columnHelper.accessor((row) => `${row.first_name} ${row.last_name || ""}`.trim(), {
        id: "name",
        header: "Name",
      }),
      columnHelper.accessor("mobile", { header: "Mobile" }),
      columnHelper.accessor("date_of_birth", {
        header: "Date of birth",
        cell: (info) => (info.getValue() ? info.getValue().substring(0, 10) : "\u2014"),
      }),
      columnHelper.accessor("gender", {
        header: "Gender",
        cell: (info) => info.getValue() || "\u2014",
      }),
      columnHelper.accessor("blood_group", {
        header: "Blood group",
        cell: (info) => info.getValue() || "\u2014",
      }),
      columnHelper.accessor("is_active", {
        header: "Status",
        cell: (info) => (
          <Chip
            size="small"
            label={info.getValue() ? "Active" : "Inactive"}
            color={info.getValue() ? "success" : "default"}
            variant="outlined"
          />
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        meta: { align: "right" },
        cell: ({ row }) => {
          const patient = row.original;
          return (
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => navigate(`/patients/${patient.id}/edit`)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={patient.is_active ? "Deactivate" : "Activate"}>
                <IconButton size="small" onClick={() => toggleActive(patient)}>
                  {patient.is_active ? (
                    <BlockIcon fontSize="small" color="error" />
                  ) : (
                    <CheckCircleIcon fontSize="small" color="success" />
                  )}
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Layout title="Patients" subtitle="Patient Management">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/patients/new")}
            sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
          >
            Register patient
          </Button>
        </Stack>

        <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable
              columns={columns}
              data={patients}
              searchPlaceholder="Search patients by name, mobile, or MRN..."
              emptyMessage="No patients registered yet."
            />
          )}
        </Paper>
      </Box>
    </Layout>
  );
}

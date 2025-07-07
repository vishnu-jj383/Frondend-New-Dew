import React, { useEffect, useState } from "react";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import MetalTable from "./MetalTable";
import DiamondTable from "./DiamondTable";
import GoldTable from "./GoldTable";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa"; // Import the back arrow icon

function CadMetal() {
  const [metalTable, setMetalTable] = useState([]);
  const [materialType, setMaterialType] = useState("");
  const [number_of_Parts, setNumberof_Parts] = useState("");
  const [weight, setWeight] = useState("");
  const [Make_Type, setMakeType] = useState("");
  const [classValue, setClassValue] = useState("");
  const [color, setColor] = useState("");
  const [diamondcolor, setDiamondColor] = useState("");
  const [purity, setPurity] = useState("");
  const [mgfpurity, setMgfPurity] = useState("");
  const [gram, setGram] = useState("");
  const [settingType, setSettingType] = useState("");
  const [sizeMM, setSizeMM] = useState("");
  const [sieveSize, setSieveSize] = useState("");
  const [caratWeight, setCaratWeight] = useState("");
  const [pieces, setPieces] = useState("");
  const [caratTotalWeight, setCaratTotalWeight] = useState("");
  const [sizeGroup, setSizeGroup] = useState("");
  const [sizeGroupid, setSizeGroupid] = useState("");
  const [quality, setQuality] = useState("");
  const [qualityGroup, setQualityGroup] = useState("");
  const [shapes, setShapes] = useState("");
  const [colorstone_qualityGroup, setColorstone_QualityGroup] = useState("");
  const [colorstone_quality, setColorstone_Quality] = useState("");
  const [colorstone_color, setColorstone_Color] = useState("");

  const navigate = useNavigate();
  const { customerId } = useParams();

  const [rows, setRows] = useState([]); // Gold
  const [colorstone_rows, setColorStoneRows] = useState([]); // Colorstone
  const [diamond_rows, setDiamondRows] = useState([]); // Diamond

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [materialType_array, setMaterialType_array] = useState([]);
  const [makeType_array, setMakeTypeArray] = useState([]);
  const [settingTypes, setSettingTypes] = useState([]);
  const [qualities, setQualities] = useState([]);
  const [shapes_array, setShapesArray] = useState([]);
  const [sizeMMOptions, setSizeMMOptions] = useState([]);
  const [diamondcolor_Options, setDiamondColoroption] = useState([]);
  const [color_stonequalities, setColorStoneQualities] = useState([]);
  const [color_stonecolor_array, setColorStoneColor_Array] = useState([]);
  const [material_class, setMeterialClass] = useState([]);
  const [color_array, SetColorArray] = useState([]);
  const [purity_array, setPurityArray] = useState([]);

  const [cadNo, setCadNo] = useState("");
  const [orderId, setOrderId] = useState("");
  const [skitchid, setSkitchid] = useState("");

  const getMetalapidata_Url = window.url + "cad/getAssemblyItemsByCadId";
  const MeratiType_Url = window.url + "materialItems/materialType";
  const MakeType_Url = window.url + "materialItems/makeTypes";
  const API_URL = window.url + "cad/addAssemblyItem";
  const Setting_URL = window.url + "materialItems/settingType";
  const Quality_URL = window.url + "materialItems/diamondQuality";
  const Shape_URL = window.url + "materialItems/shapes";
  const Size_URL = window.url + "materialItems/diamondStoneSize";
  const diamondColor_URL = window.url + "materialItems/diamondColor";
  const ColorstoneQuality_URL = window.url + "materialItems/colorStoneQuality";
  const Colorstone_Color_URL =
    window.url + "materialItems/getAllColorStoneColors";
  const MeterialClass_URL = window.url + "materialItems/metalClass";
  const Color_URL = window.url + "materialItems/metalColor";
  const Purity_URL = window.url + "materialItems/metalQuality";
  const Cad_Edit_Data_URL = window.url + `cad/getCadById/${customerId}`;

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchCustomers = async () => {
      try {
        const response = await axios.get(Cad_Edit_Data_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const customerData = response.data.data || {};
        setCadNo(customerData.id || "");
        setOrderId(customerData.orderId || "");
        setSkitchid(customerData.sketchId || "");
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      }
    };

    const getMetalapidata = async () => {
      if (!customerId) return;
      setLoading(true);
      try {
        const requestData = { cadId: customerId };
        const response = await axios.post(getMetalapidata_Url, requestData, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        });
        const customerData = response.data.data || [];
        if (customerData.length > 0) {
          const firstItem = customerData[0];
         
          setNumberof_Parts(firstItem.numberOfParts || "");
          setWeight(firstItem.grossWeight || "");
          setMakeType(firstItem.makeTypeId || "");
          //  alert(firstItem.numberOfParts)
        }
      } catch (err) {
        setError("Failed to fetch assembly items.");
        console.error("Error fetching data:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
    getMetalapidata();
  }, [navigate, customerId]);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const getMetalType_Data = async () => {
      try {
        const response = await axios.get(MeratiType_Url, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setMaterialType_array(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch material types: ${err.message}`);
      }
    };

    const getMakeType_Data = async () => {
      try {
        const response = await axios.get(MakeType_Url, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setMakeTypeArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch make types: ${err.message}`);
      }
    };

    const getSettingData = async () => {
      try {
        const response = await axios.get(Setting_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setSettingTypes(response.data.data || []);
        // alert(response.data.data)
      } catch (err) {
        console.error(`Failed to fetch setting types: ${err.message}`);
      }
    };

    const getQualityData = async () => {
      try {
        const response = await axios.get(Quality_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setQualities(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch quality data: ${err.message}`);
      }
    };

    const getShapeData = async () => {
      try {
        const response = await axios.get(Shape_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setShapesArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch shapes data: ${err.message}`);
      }
    };

    const getDiamondColorData = async () => {
      try {
        const response = await axios.get(diamondColor_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setDiamondColoroption(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch diamond color data: ${err.message}`);
      }
    };

    const getSizeData = async () => {
      try {
        const response = await axios.get(Size_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setSizeMMOptions(response.data.data || []);
        // alert(response.data.data)
      } catch (err) {
        console.error(`Failed to fetch size data: ${err.message}`);
      }
    };

    const getColorStoneQualityData = async () => {
      try {
        const response = await axios.get(ColorstoneQuality_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setColorStoneQualities(response.data.data || []);
      } catch (err) {
        console.error(
          `Failed to fetch color stone quality data: ${err.message}`
        );
      }
    };

    const getClassData = async () => {
      try {
        const response = await axios.get(MeterialClass_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setMeterialClass(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch class data: ${err.message}`);
      }
    };

    const getColorData = async () => {
      try {
        const response = await axios.get(Color_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        SetColorArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch color data: ${err.message}`);
      }
    };

    const getPurityData = async () => {
      try {
        const response = await axios.get(Purity_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setPurityArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch purity data: ${err.message}`);
      }
    };

    const getColorStoneColorData = async () => {
      try {
        const response = await axios.get(Colorstone_Color_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setColorStoneColor_Array(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch color stone color data: ${err.message}`);
      }
    };

    getMetalType_Data();
    getMakeType_Data();
    getSettingData();
    getQualityData();
    getShapeData();
    getDiamondColorData();
    getSizeData();
    getColorStoneQualityData();
    getClassData();
    getColorData();
    getPurityData();
    getColorStoneColorData();
  }, [navigate]);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchCustomers = async (sizeMMId) => {
      // alert(sizeMMId)
      try {
        const response = await axios.get(
          window.url + `materialItems/getSieve/${sizeMMId}`,
          {
            headers: { Authorization: `Bearer ${savedToken}` },
          }
        );
        const customerData = response.data.data || {};
        setSieveSize(customerData.sieveSize || "");
        setCaratWeight(customerData.stoneWeight || "");
        // alert("siveis"+customerData.id)
        setSizeGroup(
          customerData.diamondStoneSize?.diamondSizeGroup?.diamond_size_group ||
            ""
        );
        setSizeGroupid(
          customerData.diamondStoneSize?.diamondSizeGroup
            ?.diamond_size_group_id || ""
        );
      } catch (err) {
        setError("Failed to fetch sieve data.");
        console.error(err);
      }
    };

    if (sizeMM) fetchCustomers(sizeMM);
  }, [navigate, sizeMM]);

  const handlePurityChange = (e) => {
    const selectedId = e.target.value;
    setPurity(selectedId);
    const selectedPurity = purity_array.find(
      (type) => type.id.toString() === selectedId
    );
    setMgfPurity(selectedPurity ? selectedPurity.quality_mfg_clarity : "");
  };

  const handleQualityChange = (e) => {
    const selectedQualityId = e.target.value;
    setQuality(selectedQualityId);
    const selectedQuality = qualities.find(
      (q) => q.id === parseInt(selectedQualityId)
    );
    setQualityGroup(
      selectedQuality ? selectedQuality.diamond_quality_group : ""
    );
  };

  const handleColorStoneQualityChange = (e) => {
    const selectedQualityId = e.target.value;
    setColorstone_Quality(selectedQualityId);
    const selectedQuality = color_stonequalities.find(
      (q) => q.id === parseInt(selectedQualityId)
    );
    setColorstone_QualityGroup(
      selectedQuality ? selectedQuality.stone_quality_group : ""
    );
  };

  useEffect(() => {
    if (caratWeight && pieces) {
      setCaratTotalWeight(
        (parseFloat(caratWeight) * parseInt(pieces)).toString()
      );
    } else {
      setCaratTotalWeight("");
    }
  }, [caratWeight, pieces]);

  const validateFields = () => {
    const validations = {
      1: () => {
        // Color Stone
        if (!shapes) return "Shape is required";
        if (!sizeMM) return "Size MM is required";
        if (!colorstone_quality) return "Quality is required";
        if (!pieces) return "Pieces is required";
        if (!settingType) return "Setting Type is required";
        return null;
      },
      2: () => {
        // Diamond
        if (!settingType) return "Setting Type is required";
        if (!sizeMM) return "Size MM is required";
        if (!pieces) return "Pieces is required";
        if (!diamondcolor) return "Color is required";
        if (!quality) return "Quality is required";
        if (!shapes) return "Shape is required";
        return null;
      },
      3: () => {
        // Gold
        if (!classValue) return "Class is required";
        if (!color) return "Color is required";
        if (!purity) return "Purity is required";
        if (!gram) return "Gram is required";
        return null;
      },
    };

    if (!materialType) return "Material Type is required";
    const validate = validations[materialType];
    return validate ? validate() : null;
  };

  const handleAddMetal = () => {
    const errorMessage = validateFields();

    if (errorMessage) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: errorMessage,
        confirmButtonText: "OK",
      });
      return;
    }

    const newRow = {
      metalTypeId: parseInt(materialType),
      metalTypeLabel:
        materialType_array.find((m) => m.id === parseInt(materialType))
          ?.material_class || "",
      metalClassId: parseInt(classValue) || null,
      metalClassLabel:
        material_class.find((c) => c.id === parseInt(classValue))
          ?.metal_class || "",
      metalColorId: parseInt(color) || null,
      metalColorLabel:
        color_array.find((c) => c.id === parseInt(color))?.metal_color_name ||
        "",
      metalQualityId: parseInt(purity) || null,
      metalQualityLabel:
        purity_array.find((p) => p.id === parseInt(purity))?.metal_quality ||
        "",
      gram: gram ? parseFloat(gram) : null,
      DiamondColorId: parseInt(diamondcolor) || null,
      DiamondColorLabel:
        diamondcolor_Options.find((d) => d.id === parseInt(diamondcolor))
          ?.diamond_color || "",
      diamondSizegroupId: parseInt(sizeGroupid) || null,
      diamondStoneSizeId: parseInt(sizeMM) || null,
      diamondStoneSizeLabel:
        sizeMMOptions.find((s) => s.id === parseInt(sizeMM))?.sizeMm || "",
      DiamondQualityGroupId: parseInt(qualityGroup) || null,
      DiamondQualityId: parseInt(quality) || null,
      DiamondQualityLabel:
        qualities.find((q) => q.id === parseInt(quality))?.diamond_quality ||
        "",
      colorStoneColorId: parseInt(colorstone_color) || null,
      colorStoneColorLabel:
        color_stonecolor_array.find((c) => c.id === parseInt(colorstone_color))
          ?.colorstone_color || "",
      colorStoneQualityGroupId: parseInt(colorstone_qualityGroup) || null,
      colorStoneQualityId: parseInt(colorstone_quality) || null,
      colorStoneQualityLabel:
        color_stonequalities.find((q) => q.id === parseInt(colorstone_quality))
          ?.stone_quality || "",
      shapesId: parseInt(shapes) || null,
      shapesLabel:
        shapes_array.find((s) => s.id === parseInt(shapes))?.shape_name || "",
      //  sieveId: parseInt(sieveSize) || null,
      sieveLabel: sieveSize,
      pieces: pieces ? parseInt(pieces) : null,
      grossWeight: caratWeight
        ? parseFloat(caratWeight)
        : materialType == 3
        ? gram
          ? parseFloat(gram)
          : null
        : null,
    };

    console.log("New Row:", newRow);

    if (parseInt(materialType) === 3) {
      setRows((prev) => [...prev, newRow]);
    } else if (parseInt(materialType) === 2) {
      setDiamondRows((prev) => [...prev, newRow]);
    } else if (parseInt(materialType) === 1) {
      setColorStoneRows((prev) => [...prev, newRow]);
    }

    if (
      !metalTable.includes(parseInt(materialType)) &&
      parseInt(materialType) > 0
    ) {
      setMetalTable((prev) => [...prev, parseInt(materialType)]);
    }

    // Clear all fields except materialType
    setClassValue("");
    setColor("");
    setDiamondColor("");
    setPurity("");
    setMgfPurity("");
    setGram("");
    setSettingType("");
    setSizeMM("");
    setSieveSize("");
    setCaratWeight("");
    setPieces("");
    setCaratTotalWeight("");
    setSizeGroup("");
    setSizeGroupid("");
    setQuality("");
    setQualityGroup("");
    setShapes("");
    setColorstone_QualityGroup("");
    setColorstone_Quality("");
    setColorstone_Color("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const materialInformation = [
      ...colorstone_rows.map((item) => ({
        ...item,
        metalTypeId: 1,
        gram: item.gram ? parseFloat(item.gram) : null,
        grossWeight: item.grossWeight ? parseFloat(item.grossWeight) : null,
        pieces: item.pieces ? parseInt(item.pieces) : null,
      })),
      ...diamond_rows.map((item) => ({
        ...item,
        metalTypeId: 2,
        gram: item.gram ? parseFloat(item.gram) : null,
        grossWeight: item.grossWeight ? parseFloat(item.grossWeight) : null,
        pieces: item.pieces ? parseInt(item.pieces) : null,
      })),
      ...rows.map((item) => ({
        ...item,
        metalTypeId: 3,
        gram: item.gram ? parseFloat(item.gram) : null,
        grossWeight: item.grossWeight ? parseFloat(item.grossWeight) : null,
        pieces: item.pieces ? parseInt(item.pieces) : null,
      })),
    ].map((item) => {
      return {
        ...item,
        gram: item.gram === "" ? null : item.gram,
        grossWeight: item.grossWeight === "" ? null : item.grossWeight,
        pieces: item.pieces === "" ? null : item.pieces,
      };
    });

    const savedToken = Cookies.get("authToken");
    // alert(number_of_Parts)
    const dataToSend = {
      cadId: cadNo,
      sketchId: skitchid,
      orderId: orderId,
      // numberOfParts: number_of_Parts ? parseInt(number_of_Parts) : null,
      numberOfParts: number_of_Parts,
      makeTypeId: Make_Type ? parseInt(Make_Type) : null,
      weight: weight ? parseFloat(weight) : null,
      materialInformation,
    };

    try {
      const response = await axios.post(API_URL, dataToSend, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Material Input Form Created Successfully",
        confirmButtonText: "OK",
      }).then(() => {
        navigate(`/get_metal/${customerId}`);
      });
    } catch (error) {
      console.error(
        "Error creating customer:",
        error.response ? error.response.data : error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to create material input form. Please try again.",
        confirmButtonText: "OK",
      });
    }
  };

  const removeColorstoneRow = (index) => {
    setColorStoneRows((prev) => prev.filter((_, i) => i !== index));
  };

  const removeDiamondRow = (index) => {
    setDiamondRows((prev) => prev.filter((_, i) => i !== index));
  };

  const removeGoldRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBack = (customerId) => {
    navigate(`/cad_edit/${customerId}`);
  };

  return (
    <main className="main-content">
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header">
              <button
                className="btn  mb-3"
                onClick={() => handleBack(customerId)}
              >
                <FaArrowLeft className="me-2" size={25} />{" "}
                {/* Icon with margin-end */}
              </button>
            </div>

            <div className="card">
              <div className="card-header text-white">
                <center>
                  <h5 style={{ color: "black" }}>Metal Information</h5>
                </center>
              </div>

              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="numberOfParts">Number of Parts</label>
                      <input
                        type="text"
                        className="form-control"
                        id="numberOfParts"
                        placeholder="Enter Number of Parts"
                        value={number_of_Parts}
                        onChange={(e) => setNumberof_Parts(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="weight">Weight</label>
                      <input
                        type="text"
                        className="form-control"
                        id="weight"
                        placeholder="Enter Weight"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="makeType">Make Type</label>
                      <select
                        className="form-select pd-select"
                        id="makeType"
                        value={Make_Type}
                        onChange={(e) => setMakeType(e.target.value)}
                      >
                        <option value="" style={{ color: "#000" }}>
                          Select
                        </option>
                        {makeType_array.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.make_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header text-white">
                <center>
                  <h5 style={{ color: "black" }}>Material Input Form</h5>
                </center>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label htmlFor="materialType">Material Type</label>
                      <select
                        className="form-select pd-select"
                        id="materialType"
                        value={materialType}
                        onChange={(e) => setMaterialType(e.target.value)}
                      >
                        <option value="" style={{ color: "#000" }}>
                          Select
                        </option>
                        {materialType_array.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.material_class}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {materialType && (
                  <>
                    {materialType == 3 && (
                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="class">Class *</label>
                            <select
                              className="form-select pd-select"
                              id="class"
                              value={classValue}
                              onChange={(e) => setClassValue(e.target.value)}
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {material_class.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.metal_class}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="color">Color *</label>
                            <select
                              className="form-select pd-select"
                              id="color"
                              value={color}
                              onChange={(e) => setColor(e.target.value)}
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {color_array.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.metal_color_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="purity">Purity *</label>
                            <select
                              className="form-select pd-select"
                              id="purity"
                              value={purity}
                              onChange={handlePurityChange}
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {purity_array.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.metal_quality}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="mgfpurity">MFG Purity</label>
                            <input
                              type="text"
                              className="form-control"
                              id="mgfpurity"
                              value={mgfpurity}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="gram">Gram *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="gram"
                              placeholder="Enter Gram Value"
                              value={gram}
                              onChange={(e) => setGram(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {materialType == 2 && (
                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="settingType">Setting Type *</label>
                            <select
                              className="form-select pd-select"
                              id="settingType"
                              value={settingType}
                              onChange={(e) => setSettingType(e.target.value)}
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {settingTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.settingType}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                     
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="sizeMM">Size MM * </label>
                            <select
                              className="form-select pd-select"
                              id="sizeMM"
                              value={sizeMM}
                              onChange={(e) => setSizeMM(e.target.value)}
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {sizeMMOptions
                                .filter(
                                  (option) => option.material_type === "Diamond"
                                )
                                .map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.sizeMm}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="sieveSize">Sieve Size *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="sieveSize"
                              value={sieveSize}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="caratWeight">Carat Weight *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="caratWeight"
                              value={caratWeight}
                              readOnly
                            />
                          </div>
                        </div>
                        
                         {/* </div> */}


                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="pieces">Pieces *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="pieces"
                              placeholder="Enter Pieces"
                              value={pieces}
                              onChange={(e) => setPieces(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="caratTotalWeight">
                              Carat Total Weight *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="caratTotalWeight"
                              value={caratTotalWeight}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="diamondcolor">Color *</label>
                            <select
                              className="form-select pd-select"
                              id="diamondcolor"
                              value={diamondcolor}
                              onChange={(e) => setDiamondColor(e.target.value)}
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {diamondcolor_Options.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.diamond_color}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div> 
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="sizeGroup">Size Group *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="sizeGroup"
                              value={sizeGroup}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                     



{/* <div className="row"> */}
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="quality">Quality *</label>
                            <select
                              className="form-select pd-select"
                              id="quality"
                              value={quality}
                              onChange={handleQualityChange}
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {qualities.map((quality) => (
                                <option key={quality.id} value={quality.id}>
                                  {quality.diamond_quality}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="qualityGroup">
                              Quality Group *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="qualityGroup"
                              value={qualityGroup}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="shapes">Shape *</label>
                            <select
                              className="form-select pd-select"
                              id="shapes"
                              value={shapes}
                              onChange={(e) => setShapes(e.target.value)}
                            >
                              <option value="">Select</option>
                              {shapes_array
                                .filter(
                                  (shapeItem) =>
                                    shapeItem.material_class === "Diamond"
                                )
                                .map((shapeItem) => (
                                  <option
                                    key={shapeItem.id}
                                    value={shapeItem.id}
                                  >
                                    {shapeItem.shape_name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                    )}

                    {materialType == 1 && (
                      <div className="row">
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="shapes">Shape *</label>
                            <select
                              className="form-select pd-select"
                              id="shapes"
                              value={shapes}
                              onChange={(e) => setShapes(e.target.value)}
                            >
                              <option value="">Select</option>
                              {shapes_array
                                .filter(
                                  (shapeItem) =>
                                    shapeItem.material_class === "Color Stone"
                                )
                                .map((shapeItem) => (
                                  <option
                                    key={shapeItem.id}
                                    value={shapeItem.id}
                                  >
                                    {shapeItem.shape_name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="sizeMM">Size MM *</label>
                            <select
                              className="form-select pd-select"
                              id="sizeMM"
                              value={sizeMM}
                              onChange={(e) => setSizeMM(e.target.value)}
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {sizeMMOptions
                                .filter(
                                  (option) => option.material_type === "Diamond"
                                )
                                .map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.sizeMm}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="colorstone_color">Color</label>
                            <select
                              className="form-select pd-select"
                              id="colorstone_color"
                              value={colorstone_color}
                              onChange={(e) =>
                                setColorstone_Color(e.target.value)
                              }
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {color_stonecolor_array.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.colorstone_color}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="colorstone_quality">
                              Quality *
                            </label>
                            <select
                              className="form-select pd-select"
                              id="colorstone_quality"
                              value={colorstone_quality}
                              onChange={handleColorStoneQualityChange}
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {color_stonequalities.map((quality) => (
                                <option key={quality.id} value={quality.id}>
                                  {quality.stone_quality}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="pieces">Pieces *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="pieces"
                              placeholder="Enter Pieces"
                              value={pieces}
                              onChange={(e) => setPieces(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="settingType">Setting Type *</label>
                            <select
                              className="form-select pd-select"
                              id="settingType"
                              value={settingType}
                              onChange={(e) => setSettingType(e.target.value)}
                            >
                              <option value="" style={{ color: "#000" }}>
                                Select
                              </option>
                              {settingTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.settingType}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="caratWeight">Carat Weight *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="caratWeight"
                              value={caratWeight}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="caratTotalWeight">
                              Carat Total Weight *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="caratTotalWeight"
                              value={caratTotalWeight}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="sieveSize">Sieve Size *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="sieveSize"
                              value={sieveSize}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="sizeGroup">Size Group *</label>
                            <input
                              type="text"
                              className="form-control"
                              id="sizeGroup"
                              value={sizeGroup}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="form-group">
                            <label htmlFor="colorstone_qualityGroup">
                              Quality Group *
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="colorstone_qualityGroup"
                              value={colorstone_qualityGroup}
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <br />
                    <center>
                      <div className="card-action">
                        <button
                          className="btn btn-info"
                          onClick={handleAddMetal}
                        >
                          Add Metal
                        </button>
                      </div>
                    </center>
                    <br/>
                  </>
                )}

                {/* Show tables regardless of current materialType, only based on data availability */}
                {colorstone_rows.length > 0 && (
                  <MetalTable
                    rows={colorstone_rows}
                    onRemoveRow={removeColorstoneRow}
                  />
                )}
                {diamond_rows.length > 0 && (
                  <DiamondTable
                    rows={diamond_rows}
                    onRemoveRow={removeDiamondRow}
                  />
                )}
                {rows.length > 0 && (
                  <GoldTable rows={rows} onRemoveRow={removeGoldRow} />
                )}
              </div>
              <center>
                <div className="card-action">
                  <button
                    className="btn"
                    style={{ backgroundColor: "#2E1A47", color: "white" }}
                    onClick={handleSubmit}
                  >
                    Save
                  </button>
                 
                </div>
              </center>
               <br/>
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </main>
  );
}

export default CadMetal;

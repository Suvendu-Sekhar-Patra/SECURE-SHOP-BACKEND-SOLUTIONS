//pdf generation

import { Request, Response } from "express";
import { findUser } from "../services/user.service";
import jsPDF from "jspdf";

export const jsonToPdfConversion = async (req: Request, res: Response) => {
    try {
        const user = await findUser({
            mobile_number: req.body.phone,
        });

        if (!user) {
            return res.status(404).json({
                code: 404,
                message: "User not found.",
            });
        }
        //   console.log(user);
        const jsonData = {
            title: "USER INFO.",
            name: user.name,
            email: user.email,
            phone: user.mobile_number,
            Date_of_Birth: user.dob,
            address: user.present_add,
        };

        const jsonToBase64Pdf = (jsonData: any) => {
            const pdf = new jsPDF();
            let yPosition = 10;
            const labelX = 40;
            const valueX = 100;

            const addText = (text: any) => {
                pdf.text(text, 20, yPosition);
                yPosition += 10;
            };


            for (const [key, value] of Object.entries(jsonData)) {
                if (typeof value === "object" && value !== null) {
                    addText(`${key}:`);
                    for (const [subKey, subValue] of Object.entries(value)) {
                        addText(`${subKey}: ${subValue}`);
                    }
                } else {
                    switch (key) {
                        case 'title':
                            pdf.setFontSize(30);
                            pdf.setFont("Helvetica", "bold");
                            const textWidth = pdf.getTextWidth(`${value}`);
                            const xPosition = (pdf.internal.pageSize.width - textWidth) / 2;

                            pdf.text(`${value}`, xPosition, yPosition + 10);

                            const underlineY = yPosition + 13;
                            pdf.setLineWidth(1);
                            pdf.line(xPosition, underlineY, xPosition + textWidth, underlineY);

                            yPosition += 25;
                            pdf.setFontSize(20);
                            pdf.setFont("Helvetica", "normal");
                            break;

                        case 'name':
                            pdf.text(`Name:`, labelX, yPosition);
                            pdf.text(`${value}`, valueX, yPosition);
                            yPosition += 10;
                            break;

                        case 'email':
                            pdf.text(`Email:`, labelX, yPosition);
                            pdf.text(`${value}`, valueX, yPosition);
                            yPosition += 10;
                            break;

                        case 'phone':
                            pdf.text(`phone:`, labelX, yPosition);
                            pdf.text(`${value}`, valueX, yPosition);
                            yPosition += 10;
                            break;

                        case 'Date_of_Birth':
                            pdf.text(`Date_of_Birth:`, labelX, yPosition);
                            pdf.text(`${value}`, valueX, yPosition);
                            yPosition += 10;
                            break;

                        case 'address':
                            pdf.text(`Address:`, labelX, yPosition);
                            pdf.text(`${value}`, valueX, yPosition);
                            yPosition += 10;
                            break;
                    }
                }

                if (yPosition > 280) {
                    pdf.addPage();
                    yPosition = 10;
                }
            }
            // Convert PDF to Base64
            const base64String = pdf.output("datauristring");

            return base64String;
        };
        
        const base64Pdf = jsonToBase64Pdf(jsonData);

        return res.send({
            status: 200,
            message: "PDF in base64 generated successfully",
            data: base64Pdf
        });
    } catch (err: any) {
        return res.send({
            status: 500,
            data: err.message,
        });
    }
};

import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { StatusCodes } from 'http-status-codes';
import { AppDataSource } from './config';
import Logger from './logging';
import Helpers from './helpers';
import MailRequest from './entity/mail_request';

export default class MailFunctions {
  public static async SendTestEmail(this: void, _: Request, res: Response) {
    try {
      const mailAddingSuccessful = await MailFunctions.AddMailToQueue(
        '',
        'Scheduled emailing',
        'Message contents.',
      );
      if (mailAddingSuccessful) {
        Logger.Info('Successfully scheduled email request.');
      } else {
        Logger.Error('Failed to schedule email.');
      }
      res.sendStatus(StatusCodes.OK);
    } catch (error) {
      res.sendStatus(StatusCodes.BAD_REQUEST);
    }
  }

  public static InitMailQueueScheduler(limitOfEmailsPerDay: number) {
    if (limitOfEmailsPerDay <= 0) {
      throw new Error('Limit of emails per day cannot be less than or equal to zero.');
    }

    // get mail .env
    // requires:
    //      MAIL_SMTP_SERVER
    //      MAIL_SMTP_SERVER_PORT
    //      MAIL_USERNAME
    //      MAIL_PASSWORD

    const mailSendingIntervalRate = (1000 * 60 * 60 * 24) / limitOfEmailsPerDay;
    Logger.Info(`Mail sending rate set to once every ${mailSendingIntervalRate} ms.`);
    const transportOptions = {
      host: process.env.MAIL_SMTP_SERVER,
      port: parseInt(process.env.MAIL_SMTP_SERVER_PORT, 10),
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      requireTLS: true,
    };
    const mailTransporter = nodemailer.createTransport(transportOptions);
    if (process.env.NODE_ENV === 'production') {
      mailTransporter.verify((error: Error, _: boolean) => {
        if (error) {
          Logger.Error(`Mail verification unsuccessful. Reason: ${error.message}`);
          throw new Error('Failed to initialise mail service.');
        }
      });
    }

    const SendMailRequest = async () => {
      const mailRequest = await AppDataSource.getRepository(MailRequest)
        .createQueryBuilder()
        .where('MailRequest.sent = :sent', { sent: false })
        .orderBy('MailRequest.createdAt', 'ASC')
        .getOne();
      if (mailRequest == null) throw new Error('No mail request to send');

      try {
        if (process.env.NODE_ENV === 'production') {
          mailTransporter.sendMail(
            {
              from: mailRequest.sender,
              to: mailRequest.recipient,
              subject: mailRequest.subject,
              text: mailRequest.content,
              html: mailRequest.content,
            },
            () => Logger.Info(`Successfully sent EMAIL=${mailRequest.id}`),
          );
        } else {
          Logger.Info(`NODE_ENV is not production (currently ${
            process.env.NODE_ENV
          }), therefore no email will be sent. Here is the email that would have been sent:
                      ${JSON.stringify(mailRequest)}`);
        }
        await AppDataSource.createQueryBuilder()
          .update(MailRequest)
          .set({ sent: true })
          .where('id = :id', { id: mailRequest.id })
          .execute();
      } catch (error) {
        Logger.Error(`Could not find mail with ID=${mailRequest.id} to send`);
      }
    };

    setTimeout(() => SendMailRequest, mailSendingIntervalRate);
  }

  public static async AddMailToQueue(
    recipient: string,
    subject: string,
    content: string,
  ): Promise<boolean> {
    try {
      // check parameters
      try {
        Helpers.requireParameters(process.env.MAIL_USERNAME);
      } catch (error) {
        Logger.Error('[DEBUG] Mail username parameter checking failed');
      }
      try {
        Helpers.requireParameters(recipient);
      } catch (error) {
        Logger.Error('[DEBUG] Recipient parameter checking failed');
      }
      try {
        Helpers.requireParameters(subject);
      } catch (error) {
        Logger.Error('[DEBUG] Subject parameter checking failed');
      }
      try {
        Helpers.requireParameters(content);
      } catch (error) {
        Logger.Error('[DEBUG] Content parameter checking failed');
      }
      const newMailRequest: MailRequest = new MailRequest();
      newMailRequest.sender = process.env.MAIL_USERNAME;
      newMailRequest.recipient = recipient;
      newMailRequest.subject = subject;
      newMailRequest.content = content;

      await AppDataSource.manager.save(newMailRequest);
      Logger.Info('[DEBUG] Saved user mail request');

      // send a copy of this email to the admin
      const newMailRequestForAdmin: MailRequest = new MailRequest();
      newMailRequestForAdmin.sender = process.env.MAIL_USERNAME;
      newMailRequestForAdmin.recipient = process.env.MAIL_USERNAME;
      newMailRequestForAdmin.subject = subject;
      newMailRequestForAdmin.content = `The following was sent to "${recipient}" with subject "${subject}":

        CONTENT BEGINS HERE
      ------------------------
        ${content}
      `;

      await AppDataSource.manager.save(newMailRequestForAdmin);
      Logger.Info('[DEBUG] Saved admin mail request');

      // send a copy of this email to the csesoc admin
      const newMailRequestForCsesocAdmin: MailRequest = new MailRequest();
      newMailRequestForCsesocAdmin.sender = process.env.MAIL_USERNAME;
      newMailRequestForCsesocAdmin.recipient = 'careers@csesoc.org.au';
      newMailRequestForCsesocAdmin.subject = subject;
      newMailRequestForCsesocAdmin.content = `The following was sent to "${recipient}" with subject "${subject}":

        CONTENT BEGINS HERE
      ------------------------
        ${content}
      `;

      await AppDataSource.manager.save(newMailRequestForCsesocAdmin);
      Logger.Info('[DEBUG] Saved CSESoc admin mail request');

      return true;
    } catch (error: unknown) {
      Logger.Error(`AddMailToQueue FAILED with error ${(error as Error).message}`);
      return false;
    }
  }
}
